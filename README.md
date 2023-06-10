# Twitter Clone Backend

## What is this?

This project is the backend to a Twitter clone. I have another repo with the frontend. I started this project by following the steps in [this YouTube series by notJust.dev](https://www.youtube.com/watch?v=sNixa64aG9Y).

Essentially, this Twitter clone allows users to create an account or sign in via a passwordless authentication workflow. The passwordless authentication workflow involves a user providing their email to the app, the user receiving an email with a code, the user entering that code into the app, and the app storing a JSON Web Token onto their device. When the user's device has a valid JSON Web Token, they are authenticated. When authenticated, users can see every tweet and create new tweets.

Behind the application, there is a database with a token table, a tweet, and a user table. The token table stores the email codes and the JSON Web Tokens used in the passwordless authentication workflow. The application's backend communicates to the database via [Drizzle ORM](https://orm.drizzle.team/), while the application's frontend communicates to the backend via REST API endpoints.

## Can you show me how the app works?

Here is a simple example of how you can use the app.

1. Enter your email and click on Sign In.  
   <img alt="Sign in page with an email entered in" src="https://uploadthing.com/f/7ff90892-7160-4abc-a737-0b4dd4456a70_demo%20pt%201.jpg" width=25% height=25%>

2. Find the email with the single-use, six-digit code.  
   <img alt="Email with the code" src="https://uploadthing.com/f/6bcef9ed-605f-4b6e-95f3-ee29c5fc18c9_demo%20pt%202.jpg">

3. Enter the code and click on Confirm.  
   <img alt="Confirmation page with the code entered in" src="https://uploadthing.com/f/ef7b6937-5468-4c79-b792-932cdae5f14e_demo%20pt%203.jpg" width=25% height=25%>

4. At the moment, you update the user with a name and an image using a tool similar to Insomnia.  
   <img alt="HTTP request completed by Insomnia" src="https://uploadthing.com/f/3584f364-b99a-4e8f-8e56-ed49572a0d91_demo%20pt%204.jpg">

5. Click on the bottom right blue button with a plus.  
   <img alt="Feed page" src="https://uploadthing.com/f/05345342-f26e-4b21-8c2c-a3df2d727352_demo%20pt%205.jpg" width=25% height=25%>

6. Enter some text for a tweet and click on Tweet.  
   <img alt="New tweet page with text entered in" src="https://uploadthing.com/f/0c3b201c-6819-4880-a971-c1b01e7e7beb_demo%20pt%206.jpg" width=25% height=25%>

7. You can see your new tweet in the feed!  
   <img alt="Feed page with new tweet" src="https://uploadthing.com/f/6b578d16-be0a-4a71-b000-df8f3b87f092_demo%20pt%207.jpg" width=25% height=25%>

## How can I recreate this app?

1. Download the [twitter-clone-frontend](https://github.com/Noisey96/twitter-clone-frontend) and [twitter-clone-backend](https://github.com/Noisey96/twitter-clone-backend) repos.
2. Obtain a database and connect it to the backend.
3. Obtain an email service and connect it to the backend.
4. Connect the frontend to the backend.
5. Run the backend and then the frontend.

## Why did you try to clone Twitter of all things?

I found a [YouTube series by notJust.dev](https://www.youtube.com/watch?v=sNixa64aG9Y) where he built a fullstack Twitter Clone. This YouTube series by notJust.dev seemed to be a great opportunity. First off, I have developed [React](https://react.dev/) frontends before, but not in mobile development. Second, I have previous experiences working with databases, but those previous experiences were with Oracle databases integrated with other Oracle products. Third, I have never developed a backend before. Therefore, this project used a bunch of new tools. You can find them below in the credits section.

## Where will this go?

Essentially, the plan is to clean up the existing app. Because I used a large [Expo](https://expo.dev/) template, there are many unnecessary files and code. In cleaning up the app, I plan to allow users to sign out of the app and to improve how authentication works under the hood. After cleaning up the app, I plan to add new pages related to adding, updating and deleting the current user's details. Finally, I plan to implement the ability to upload pictures to the app.

## Credits

For this app, I used a ton of resources and tools. Here are the resources and tools I used the most:

1. [Amazon AWS - EC2 and SES](https://aws.amazon.com/)
2. [Beekeeper Studio](https://www.beekeeperstudio.io/)
3. [Drizzle ORM](https://orm.drizzle.team/)
4. [Expo](https://expo.dev/)
5. [Express](https://expressjs.com/)
6. [Insomnia](https://insomnia.rest/)
7. [Neon](https://neon.tech/)
8. [PM2](https://pm2.keymetrics.io/)
9. [React](https://react.dev/)
10. [React Native](https://reactnative.dev/)
11. [TanStack Query](https://tanstack.com/query/latest)
12. [TypeScript](https://www.typescriptlang.org/)
13. [YouTube Series by notJust.dev](https://www.youtube.com/watch?v=sNixa64aG9Y)
