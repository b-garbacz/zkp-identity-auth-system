use bellman::{
    gadgets::multipack,
    groth16::{self, Proof, VerifyingKey}
};
use bls12_381::Bls12;
use base64::{engine::general_purpose::URL_SAFE as base64Engine, Engine as BaseEngine};
use axum::{
    Router,
    routing::post,
    http::{StatusCode, Request, Response, header},
    response::IntoResponse,
    extract::Json,
    middleware::{self, Next},
    body::Body,
};
use serde::{Deserialize, Serialize};
use tokio;
use tracing_subscriber;
use chrono::{Datelike, TimeZone, Utc};

async fn options() -> impl IntoResponse {
    Response::builder()
        .status(StatusCode::OK)
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000")
        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "Content-Type")
        .header(header::ACCESS_CONTROL_ALLOW_METHODS, "POST, GET, OPTIONS")
        .body(Body::empty())
        .unwrap()
}

async fn cors(req: Request<Body>, next: Next) -> impl IntoResponse {
    let response = next.run(req).await;
    Response::builder()
        .status(response.status())
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000")
        .header(header::ACCESS_CONTROL_ALLOW_HEADERS, "Content-Type")
        .header(header::ACCESS_CONTROL_ALLOW_METHODS, "POST, GET, OPTIONS")
        .body(response.into_body())
        .unwrap()
}

fn is_over_18(timestamp: Option<i64>) -> bool {
    let date_of_birth = match timestamp {
        Some(timestamp) => {
            if timestamp > 1_000_000_000 {
                timestamp
            } else {
                timestamp * 1000
            }
        },
        None => return false,
    };
    let birth_date = match Utc.timestamp_opt(date_of_birth / 1000, 0) {
        chrono::LocalResult::Single(dt) => dt,
        _ => return false,
    };
    let current_date = Utc::now();
    let mut age = current_date.year() - birth_date.year();
    let month_difference = current_date.month() as i64 - birth_date.month() as i64;
    let day_difference = current_date.day() as i64 - birth_date.day() as i64;
    if month_difference < 0 || (month_difference == 0 && day_difference < 0) {
        age -= 1;
    }

    age >= 18
}

fn is_expired(expiry_timestamp: Option<i64>) -> bool {
    let current_timestamp = Utc::now().timestamp();
    if let Some(expiry_date) = expiry_timestamp {
        if expiry_date > current_timestamp {
            return false;
        }
    } else {
        return true;
    }
    
    true 
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let app = Router::new()
    .route("/verify_zkp", post(verify_zkp))
    .route("/verify_zkp", axum::routing::options(options))
    .layer(middleware::from_fn(cors));

    let addr = "127.0.0.1:8080";
    println!("Listening on {}", addr);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn verify_zkp(Json(payload): Json<ZKPData>) -> impl IntoResponse {
    if zkp_verification(&payload.proofData) {
        (StatusCode::OK, "Verification successful")
    } else {
        (StatusCode::BAD_REQUEST, "Verification failed")
    }
}

fn i64_to_byte_array(input: Option<i64>) -> [u8; 8] {
    match input {
        Some(result) => result.to_be_bytes(),
        None => [0; 8], 
    }
}

fn zkp_verification(encoded: &str) -> bool {
    let decoded_user_data_proof = match base64Engine.decode(encoded.as_bytes()) {
        Ok(decoded) => decoded,
        Err(e) => {
            println!("Base64 decoding error: {}", e);
            return false;
        }
    };

    let deserialized_user_data_proof: Result<UserDataProof, _> = serde_json::from_slice(&decoded_user_data_proof);

    let user_data_proof = match deserialized_user_data_proof {
        Ok(user_data_proof) => user_data_proof,
        Err(e) => {
            println!("Deserialization error: {}", e);
            return false;
        }
    };

    if !is_over_18(user_data_proof.date_of_birth) {
        return false
    }
    
    if is_expired(user_data_proof.expiry_date){
        return false
    }

    let decoded_proof = match base64Engine.decode(user_data_proof.proof.as_bytes()) {
        Ok(decoded) => decoded,
        Err(e) => {
            println!("Base64 decoding error for proof: {}", e);
            return false;
        }
    };

    let decoded_verifying_key = match base64Engine.decode(user_data_proof.verifying_key.as_bytes()) {
        Ok(decoded) => decoded,
        Err(e) => {
            println!("Base64 decoding error for verifying key: {}", e);
            return false;
        }
    };

    let vkdecoded: VerifyingKey<Bls12> = VerifyingKey::read(&mut &decoded_verifying_key[..]).unwrap();
    let pvk: groth16::PreparedVerifyingKey<Bls12> = groth16::prepare_verifying_key(&vkdecoded);
    let proofdecoded: Proof<Bls12> = Proof::read(&mut &decoded_proof[..]).unwrap();
    let hash_bytes: Vec<u8> = (0..user_data_proof.hash.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&user_data_proof.hash[i..i+2], 16).unwrap())
            .collect();
        
    let hash_bits = multipack::bytes_to_bits_le(&hash_bytes);
    let hash_inputs = multipack::compute_multipacking(&hash_bits);


    let birthdate = i64_to_byte_array(user_data_proof.date_of_birth);
    let birthdate_bits = multipack::bytes_to_bits_le(&birthdate);
    let birthdate_inputs = multipack::compute_multipacking(&birthdate_bits);

    let expiry_date = i64_to_byte_array(user_data_proof.expiry_date);
    let expiry_date_bits = multipack::bytes_to_bits_le(&expiry_date);
    let expiry_date_inputs = multipack::compute_multipacking(&expiry_date_bits);

    let inputs = [birthdate_inputs, expiry_date_inputs, hash_inputs].concat();
    
    groth16::verify_proof(&pvk, &proofdecoded, &inputs).is_ok()
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserDataProof {
    pub hash: String,
    pub date_of_birth: Option<i64>,
    pub expiry_date: Option<i64>,
    pub proof: String,
    pub verifying_key: String,
}

#[derive(Deserialize)]
struct ZKPData {
    proofData: String,
}