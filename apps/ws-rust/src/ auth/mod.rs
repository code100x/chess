use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Deserialize, Serialize)]
struct Claims {
    user_id: String,
    exp: DateTime<Utc>, 
    iat: DateTime<Utc>,
    // alll the  other  fields here we can add later 
}

pub async fn extract_user_id(token: String) -> String {
    let validation = Validation::default();
    let decoded = decode::<Claims>(
        &token,
        &DecodingKey::from_secret(validation.secret.as_ref()),
        &validation.algorithms,
    )
    .await;

    match decoded {
        Ok(claims) => claims.user_id,
        Err(_) => "".to_string(),
    }
}
