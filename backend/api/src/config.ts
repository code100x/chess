import * as dotenv from 'dotenv';
dotenv.config();

export const API_PORT = process.env.API_PORT || 8080;

export const HASURA_URL =
    process.env.HASURA_URL || "http://localhost:8112/v1/graphql";

// JWT FOR HASURA HEADERS {
//   "https://hasura.io/jwt/claims": {
//     "x-hasura-allowed-roles": [
//       "admin"
//     ],
//     "x-hasura-default-role": "admin"
//   },
//   "iat": 1664247716
// }
export const JWT =
    process.env.AUTH_JWT ||
    "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsiYWRtaW4iXSwieC1oYXN1cmEtZGVmYXVsdC1yb2xlIjoiYWRtaW4ifSwiaWF0IjoxNjY0MjQ3NzE2fQ.RMvnfvZtfhgQvCGj5HeT_4qDk1jjGTVLvO4hXQhxvH1QOU3E4yWv5rqDwhGeH9m2aZh7EiV8s3zQ70XkvPV-TA";

export const HASURA_ADMIN_SERCRET =
    process.env.HASURA_ADMIN || "myadminsecretkey";

// random-key
export const AUTH_JWT_PUBLIC_KEY =
    process.env.AUTH_JWT_PUBLIC_KEY ||
    "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqx+7XJxJR+0Lp8hLFKYr5Gc+0RPIdaZJ18GH8b//oMn7PCVe0gLQDkxjvhKo2ySMgWSOSGaNJkZXLhN4jlot/xaulN3dSbrgQPxvx3ALd3nXJaTLOb7xBODd196r+Ylg1QPICdrBQVi6qAXacq/UBK8K7BWQ0TG2/R9aB5mNSGtY3Ogj9xp2MP5LTi7f2Alj6IwSFRN+9SCmH3NiQzNUPBWJB02Lgx1oxwtfevkQ3BpwIqzkOTTE1G7PXgKbYRBUlUNqwvMIjk89tRf/qHgMbRPGYYNu7XoRt8AOVgNFUcL51Gb9vM75XstWoAh6BwYQsceEXUU7dgIJem9zItFRdwIDAQAB-----END PUBLIC KEY-----";

// random-key
export const AUTH_JWT_PRIVATE_KEY =
    process.env.AUTH_JWT_PRIVATE_KEY ||
    "-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCrH7tcnElH7QunyEsUpivkZz7RE8h1pknXwYfxv/+gyfs8JV7SAtAOTGO+EqjbJIyBZI5IZo0mRlcuE3iOWi3/Fq6U3d1JuuBA/G/HcAt3edclpMs5vvEE4N3X3qv5iWDVA8gJ2sFBWLqoBdpyr9QErwrsFZDRMbb9H1oHmY1Ia1jc6CP3GnYw/ktOLt/YCWPojBIVE371IKYfc2JDM1Q8FYkHTYuDHWjHC196+RDcGnAirOQ5NMTUbs9eApthEFSVQ2rC8wiOTz21F/+oeAxtE8Zhg27tehG3wA5WA0VRwvnUZv28zvley1agCHoHBhCxx4RdRTt2Agl6b3Mi0VF3AgMBAAECggEAMom1kN1LOyXDynJ50ghdcCAZyi+YhT5uEn1Cg+AbQ8ZDH3k97rIL9h0TXAAwxD+gC1rCNpmq2AHwH1h6wzfY27w8JRT9FJhPQIINFQ5/JHLkWma36j78+V7bxbQqgBDVezOZsWdcqcrlnVfVMwfAiv2TMTQRR+bxzwGiWho8QoWNq1UcA8GGOE3vzWGrZJbgVwG43xUVDJtMem9w4QwlHLwekP3Q46Lqx1AOtesN39h/HduJtWtYGcw/t2TkIW9UibmBqZy7rkZW+4hCXhGBI6YhAUYnuyP6ZT+r1+J2aPlJeo2yIyjc6YVxoFwUR7QWtINzuBtG9v/YXfmtYCnEIQKBgQDd3E/nX4Vc7xolvoQZzN+0XWnyLqPgtAL63RLFfb8/lhnHHzca2k2eI0+P6I9etDa9c+i4l7/RM5LUkwxd8RGH6S4m8FiUkdKyaiwK1PAGRiUbWaij9WjKVjp7QhEtisQvtyMa9quwpv3C02zbD31/PqgeTmXOH0Aweh162qyeBwKBgQDFdMQ13JCkQe3GNO06EEPE+NjFkLqBVP2leDXmUVZRnHUN4OMpjCb9H0+/4rOAusCRmS9kALoeo6U9ykC5mqUViVzeTqnHXctD4llvEzSngDU/4+cbUQG3obj8JG9lupe/p3r6gRvB13nWiwVzj2wgK2SY0HGG1gaRaIS3K2nVEQKBgQCNhlJ6V9as9+GIHkYKZ0R0u/ovgU0MtAgKmye0T4jGOSvsd58hRAyrSf8g38tFMFSS+fOEfVjhTLLnY35KFtOGDVthf4QiEfuD0HKT3k3W0rws/D61iID2QZdAtV5b3N9VSM/eDWhsYboSo+gWvYTivMdlvcD3gbvisKNJkWD31QKBgCdgIqSPCHUJBK6K7WevyKPl7+xt8RNLbI1rzGvSeoEpzxnmZ8ZoQXomnVOplJwuIaqnPpEVqAfmIFSTGZcppJQH4XIfg7HTHW67G5SP4ucoJPZJr1N+MvZ4lJgLd/90V0CL2HVN+8gK/SvwazThO/GqVZQ3tPvrgEHM8vJIAQHRAoGAEjFMNmitScLogo9Cq5oX88/KpDOfCi+IG19g0HdaepgzreDzallcKf/XnXX9d7wuTuoSRNsq7RfCmLAUlzC+Waw0dpwLkZjgeVvFdrADGOFDKEovesZ0NBQ+Ln0SXJVRaynRxgnrjYINE+1I3uE8XZie4NMh5pybTXBpyx/cIz0=-----END PRIVATE KEY-----";

export const REDIS_URL =
    process.env.REDIS_URL || "redis://localhost:6379";