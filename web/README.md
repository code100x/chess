# 🔐 Authify - Auth for devs (Next-auth V5)

Authify delivers a developer-friendly authentication solution 🤝. Our focus: Simplicity meets Robust Security! 🛡️ Seamlessly integrate into your projects with ease, hassle-free implementation guaranteed! 🌐💻 
> Demo Available @ bottom 🎥

## 🚀 Key Features

- **MFA Login**: Securely authenticate users with Multi-Factor Authentication for an added layer of protection.
- **Password Recovery**: Enable users to recover their passwords through a secure and user-friendly process.
- **Resend Verification Emails**: Effortlessly resend verification emails to users, ensuring a smooth onboarding experience.
- **Role-Based Access Control (RBAC)**: Implement fine-grained access controls with role-based permissions, allowing you to tailor access levels to different users.
- **Server and Client Components Built-in**: Authify comes with both server and client components out of the box, streamlining the integration process for your application.
- **Customizable to Your Needs**: Tailor Authify to fit your specific requirements by customizing its features and functionality according to your application's unique needs.

##  ⚡️ Quick Setup (Use this repo as a template and start coding 👨🏻‍💻)
## 1. Install Dependencies

```bash
npm i
```
## 2. Configure Environment Variables:
Copy the .env.example file to a new file named .env. Update the file with your secrets and credentials.

```bash
cp .env.example .env
# Edit the .env file with your secrets
```
## 3. Create OAuth Apps
Create OAuth apps on Google and GitHub. Obtain the client IDs and secrets, then update your .env file with these values.

## 4. Set Up Prisma
Run the following commands to set up and generate Prisma:

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```
## 5. Set Up Local Database or Spin Up your own.
If you don't have Docker installed, you can install it from Docker's official website.

```bash
docker run -p 5432:5432 --name your-postgres-container -e POSTGRES_PASSWORD=your-password -d postgres
```
### or

Use neon.tech for PostgreSQL:
Follow the instructions on neon.tech to set up a PostgreSQL database.

## 7. Optional: Set Up Email (with Resend)
Configure email settings if you want to enable email functionality. Update the necessary fields in your .env file.

## 8.  Start the Development Server
Run the following command to start the development server:
```bash
npm run dev
```
### Your Authify setup should now be running locally. Access it at http://localhost:3000. 🎉

## 📦 Built With

- TailwindCSS
- NextJS
- TypeScript
- Resend
- Next-Auth
- Shadcn-UI

## 💡 Future Improvements

- *Testing*: Add certain edge test cases to test the product on every paradigm.
- *EnterPrise Level*: Introduction of enterprise level SSO.
- *Themes*: Let users pick their own color themes, including dark and light mode.
- *PassKey Authentication*: Addition of web-authn passkey authentication in the future.

## 🎬 Video

https://github.com/Neon-20/Authy/assets/55043383/c4921663-f1c9-4e17-a0b5-124934f83f0b
