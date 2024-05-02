
use bellman::{
    gadgets::{
        boolean::{AllocatedBit, Boolean},
        multipack,
        sha256::sha256,
    },
    groth16::{self, Proof, VerifyingKey}, Circuit, ConstraintSystem, SynthesisError
};

use bls12_381::Bls12;
use ff::PrimeField;
use rand::Rng;
use sha2::{Digest, Sha256};

use serde::{Deserialize, Serialize};
use base64::{engine::general_purpose::URL_SAFE as base64Engine, Engine as BaseEngine};
use concat_arrays::concat_arrays;
use wasm_bindgen::prelude::*;

extern crate console_error_panic_hook;
use std::panic;


//Gadget sha256
fn sha256circut<Scalar: PrimeField, CS: ConstraintSystem<Scalar>>(
    mut cs: CS,
    data: &[Boolean],
) -> Result<Vec<Boolean>, SynthesisError> {
    let input: Vec<_> = data
        .chunks(8)
        .map(|c| c.iter().rev())
        .flatten()
        .cloned()
        .collect();

    let res = sha256(cs.namespace(|| "SHA-256(input)"), &input)?;

    Ok(res
        .chunks(8)
        .map(|c| c.iter().rev())
        .flatten()
        .cloned()
        .collect())
}

struct AgeVerificationCircuit{
    date_of_birth: Option<[u8; 8]>,
    expiry_date: Option<[u8; 8]>,
    personal_number: Option<[u8; 11]>,
    identity_card_number: Option<[u8; 10]>
}
impl<Scalar: PrimeField> Circuit<Scalar> for AgeVerificationCircuit {
    fn synthesize<CS: ConstraintSystem<Scalar>>(self, cs: &mut CS) -> Result<(), SynthesisError> {

        //Mapping to bits
        let date_of_birth_values = if let Some(date_of_birth) = self.date_of_birth {
            date_of_birth
                .into_iter()
                .map(|byte| (0..8).map(move |i| (byte >> i) & 1u8 == 1u8))
                .flatten()
                .map(|b| Some(b))
                .collect()
        } else {
            vec![None; 8 * 8]
        };
        assert_eq!(date_of_birth_values.len(), 8 * 8);

        let expiry_date_values = if let Some(expiry_date) = self.expiry_date {
            expiry_date
                .into_iter()
                .map(|byte| (0..8).map(move |i| (byte >> i) & 1u8 == 1u8))
                .flatten()
                .map(|b| Some(b))
                .collect()
        } else {
            vec![None; 8 * 8]
        };
        assert_eq!(expiry_date_values.len(), 8 * 8);

        let personal_number_values = if let Some(personal_number) = self.personal_number {
            personal_number
                .into_iter()
                .map(|byte| (0..8).map(move |i| (byte >> i) & 1u8 == 1u8))
                .flatten()
                .map(|b| Some(b))
                .collect()
        } else {
            vec![None; 11 * 8]
        };
        assert_eq!(personal_number_values.len(), 11 * 8);

        let identity_card_number_values = if let Some(identity_card_number) = self.identity_card_number {
            identity_card_number
                .into_iter()
                .map(|byte| (0..8).map(move |i| (byte >> i) & 1u8 == 1u8))
                .flatten()
                .map(|b| Some(b))
                .collect()
        } else {
            vec![None; 10 * 8]
        };
        assert_eq!(identity_card_number_values.len(), 10 * 8);
        
        //Bit allocation

        let date_of_birth_bits = date_of_birth_values
            .into_iter()
            .enumerate()
            .map(|(i, b)| {
                AllocatedBit::alloc(cs.namespace(|| format!("date of birth bit {}", i)), b)
            })
            .map(|b| b.map(Boolean::from))
            .collect::<Result<Vec<_>, _>>()?;


        let expiry_date_bits = expiry_date_values
            .into_iter()
            .enumerate()
            .map(|(i, b)| {
                AllocatedBit::alloc(cs.namespace(|| format!("expiry date bit {}", i)), b)
            })
            .map(|b| b.map(Boolean::from))
            .collect::<Result<Vec<_>, _>>()?;

        let personal_number_bits = personal_number_values
            .into_iter()
            .enumerate()
            .map(|(i, b)| {
                AllocatedBit::alloc(cs.namespace(|| format!("personal number bit {}", i)), b)
            })
            .map(|b| b.map(Boolean::from))
            .collect::<Result<Vec<_>, _>>()?;

        let identity_card_number_bits = identity_card_number_values
            .into_iter()
            .enumerate()
            .map(|(i, b)| {
                AllocatedBit::alloc(cs.namespace(|| format!("identity card number bit {}", i)), b)
            })
            .map(|b| b.map(Boolean::from))
            .collect::<Result<Vec<_>, _>>()?;

        // make date of birth and expiry date as public inputs
        multipack::pack_into_inputs(cs.namespace(|| "date_of_birth_bits"), &date_of_birth_bits)?;
        multipack::pack_into_inputs(cs.namespace(|| "expiry_date_bits"), &expiry_date_bits)?;


        // bit concatenation
        let combined_bits:Vec<_> =  date_of_birth_bits.into_iter().chain(
            expiry_date_bits.into_iter().chain(
                personal_number_bits.into_iter().chain(
                    identity_card_number_bits.into_iter())))
            .collect();
        

        let hash = sha256circut(cs.namespace(|| "SHA-256d(preimage)"), &combined_bits)?;

        multipack::pack_into_inputs(cs.namespace(|| "pack hash"), &hash)       
    }
}

fn i64_to_byte_array(input: Option<i64>) -> [u8; 8] {
    match input {
        Some(result) => result.to_be_bytes(),
        None => [0; 8], 
    }
}

fn string_to_byte_11(input: Option<String>) -> [u8; 11] {
    match input {
        Some(input_) => {
            let mut result = [0u8; 11];
            let bytes = input_.as_bytes();
            let len = bytes.len().min(11);
            result[..len].copy_from_slice(&bytes[..len]);
            result
        },
        None => [0u8; 11],
    }
}
fn string_to_byte_10(input: Option<String>) -> [u8; 10] {
    match input {
        Some(input_) => {
            let mut result = [0u8; 10];
            let bytes = input_.as_bytes();
            let len = bytes.len().min(10);
            result[..len].copy_from_slice(&bytes[..len]);
            result
        },
        None => [0u8; 10],
    }
}
#[derive(Deserialize, Debug)]
struct PersonalData {
    pub surname: Option<String>,
    #[serde(rename = "givenNames")]
    pub given_names: Option<String>,
    #[serde(rename = "familyName")]
    pub family_name: Option<String>,
    #[serde(rename = "parentsName")]
    pub parents_name: Option<String>,
    #[serde(rename = "dateOfBirth")]
    pub date_of_birth: Option<i64>,
    #[serde(rename = "dateOfIssue")]
    pub date_of_issue: Option<i64>,
    #[serde(rename = "expiryDate")]
    pub expiry_date: Option<i64>,
    #[serde(rename = "personalNumber")]
    pub personal_number: Option<String>,
    #[serde(rename = "identityCardNumber")]
    pub identity_card_number: Option<String>,
}

impl PersonalData {
    pub fn new(personal_data_base64: &str) -> serde_json::Result<Self> {
        let personal_data_bytes = base64Engine.decode(personal_data_base64).unwrap();
        serde_json::from_slice(&personal_data_bytes)
    } 

}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserDataProof {
    pub hash: String,
    pub date_of_birth: Option<i64>,
    pub expiry_date: Option<i64>,
    pub proof: String,
    pub verifying_key: String,
}

impl UserDataProof {
    pub fn new(hash_: &String, date_of_birth_: &Option<i64>, expiry_date_: &Option<i64>, proof_vecu8_: &Vec<u8>, verifying_key_vecu8_: &Vec<u8>) -> Self{   
        Self { hash: hash_.clone(),
            date_of_birth: date_of_birth_.clone(),
            expiry_date: expiry_date_.clone(),
            proof: base64Engine.encode(proof_vecu8_),
            verifying_key: base64Engine.encode(verifying_key_vecu8_)
        }
        
    }
    pub fn serialize(&self) -> serde_json::Result<String> {
        serde_json::to_string(self)
    }
}
#[wasm_bindgen]
pub fn age_proof_generation(base64_data: &str) -> String {
    panic::set_hook(Box::new(console_error_panic_hook::hook));
    let personal_info = match PersonalData::new(base64_data) {
        Ok(personal_data) => personal_data,
        Err(e) => {
            println!("Error parsing data: {}", e);
            return String::new();
        },
    };
    

    let  date_of_birth  = i64_to_byte_array(personal_info.date_of_birth);
    let  expiry_date = i64_to_byte_array(personal_info.expiry_date);
    let  personal_number =  string_to_byte_11(personal_info.personal_number);
    let  identity_card_number =  string_to_byte_10(personal_info.identity_card_number);
    let mut rng = rand::thread_rng();


    let params = {
        let c: AgeVerificationCircuit = AgeVerificationCircuit {
            date_of_birth: None, 
            expiry_date: None, 
            personal_number: None, 
            identity_card_number: None, 
        };
        groth16::generate_random_parameters::<Bls12, _, _>(c, &mut rng).unwrap()
    };
    
    let c = AgeVerificationCircuit {
        date_of_birth: Some(date_of_birth),
        expiry_date: Some(expiry_date),
        personal_number: Some(personal_number),
        identity_card_number: Some(identity_card_number),

    };
    
    let proof = groth16::create_random_proof(c, &params, &mut rng).unwrap();

    let mut proof_buffer = Vec::new();
    let _ = proof.write(&mut proof_buffer);
    let mut vk_buffer = Vec::new();
    let _ = params.vk.write(&mut vk_buffer);

    let combined: [u8; 37] = concat_arrays!(date_of_birth,expiry_date, personal_number, identity_card_number);
    
    let hash = Sha256::digest(&combined).iter().map(|byte| format!("{:02x}", byte)).collect::<String>();

    let user_data_proof: UserDataProof = UserDataProof::new(
        &hash, 
        &personal_info.date_of_birth, 
        &personal_info.expiry_date, 
        &proof_buffer, 
        &vk_buffer
    );

    let encoded_serialized_user_data_proof = match user_data_proof.serialize() {
        Ok(serialized_user_data_proof) => {
            base64Engine.encode(&serialized_user_data_proof)
        }
        Err(e) => {
            println!("Serialization error: {}", e);
            return String::new();
        }
    };
    encoded_serialized_user_data_proof
}


#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_age_proof_generation() {
        let base64_data = "ewogICJzdXJuYW1lIjoiIE5BWldJU0tPIiwKICAiZ2l2ZW5OYW1lcyI6IiBJTUlFIiwKICAiZmFtaWx5TmFtZSI6IiBOQVpXSVNLTyIsCiAgInBhcmVudHNOYW1lIjoiVEVTVCBURVNUIiwKICAiZGF0ZU9mQmlydGgiOjg5NTUyODgwMCwKICAiZGF0ZU9mSXNzdWUiOjE0NjM5NTQ0MDAsCiAgImV4cGlyeURhdGUiOjE3Nzk0ODcyMDAsCiAgInBlcnNvbmFsTnVtYmVyIjoiMTExMTExMTExMTEiLAogICJpZGVudGl0eUNhcmROdW1iZXIiOiJDQ0M0NDQ0NDQiCn0=";
        let result = age_proof_generation(base64_data);
        let decoded_user_data_proof = match base64Engine.decode(result.as_bytes()) {
            Ok(decoded) => decoded,
            Err(e) => {
                println!("Base64 decoding error: {}", e);
                return;
            }
        };
        let deserialized_user_data_proof: Result<UserDataProof, _> = serde_json::from_slice(&decoded_user_data_proof);
        let user_data_proof = match deserialized_user_data_proof {
            Ok(user_data_proof) => user_data_proof,
            Err(e) => {
                println!("Deserialization error: {}", e);
                return;
            }
        };

        // Dekodowanie danych z base64 do ciągów bajtów
        let decoded_proof = match base64Engine.decode(user_data_proof.proof.as_bytes()) {
            Ok(decoded) => decoded,
            Err(e) => {
                println!("Base64 decoding error for proof: {}", e);
                return;
            }
        };

        let decoded_verifying_key = match base64Engine.decode(user_data_proof.verifying_key.as_bytes()) {
            Ok(decoded) => decoded,
            Err(e) => {
                println!("Base64 decoding error for verifying key: {}", e);
                return;
            }
        };

        // Weryfikacja dowodu
        let vkdecoded: VerifyingKey<Bls12> = VerifyingKey::read(&mut &decoded_verifying_key[..]).unwrap();
        let proofdecoded: Proof<Bls12> = Proof::read(&mut &decoded_proof[..]).unwrap();

        let pvk2: groth16::PreparedVerifyingKey<Bls12> = groth16::prepare_verifying_key(&vkdecoded);


        let hash_bytes: Vec<u8> = (0..user_data_proof.hash.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&user_data_proof.hash[i..i+2], 16).unwrap())
            .collect();
        
        let hash_bits = multipack::bytes_to_bits_le(&hash_bytes);
        let hash_inputs = multipack::compute_multipacking(&hash_bits);


        let data_urodzenia = i64_to_byte_array(user_data_proof.date_of_birth);
        let date_bits = multipack::bytes_to_bits_le(&data_urodzenia);
        let date_inputs = multipack::compute_multipacking(&date_bits);

        let data_wygasmoecoa = i64_to_byte_array(user_data_proof.expiry_date);
        let expiry_date_bits = multipack::bytes_to_bits_le(&data_wygasmoecoa);
        let expiry_date_inputs = multipack::compute_multipacking(&expiry_date_bits);

        let inputs = [date_inputs, expiry_date_inputs, hash_inputs].concat();
        
        // co potrzebuję do weryfikacji dowodu? pvk, proof oraz inputy. 
        assert!(groth16::verify_proof(&pvk2, &proofdecoded, &inputs).is_ok());   
        }
}
