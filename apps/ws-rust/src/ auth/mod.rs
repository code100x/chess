use jsonwebtoken::{decode, Validation};

pub fn extract_user_id(token: String) -> String {
    let validation = Validation::default();
    let decoded = decode::<serde_json::Value>(&token, &validation.secret, &validation.algorithms);

    match decoded {
        Ok(data) => data.claims.get("userId").unwrap().as_str().unwrap().to_string(),
        Err(_) => "".to_string(),
    }
}
