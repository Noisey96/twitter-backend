# Twitter Clone Backend

## What?

This project is the backend to a Twitter Clone. I have another repo with the frontend. This project was started by following the steps in this video series by notJust.dev. At the moment, this project deviates from the video series by using Drizzle ORM instead of Prisma, using Neon instead of Amazon RDS, and using an HTML template instead of text for the emails.

Essentially, this Twitter clone allows users to create an account or sign in via a passwordless authentication workflow. Once authenticated, users can see every tweet and create new tweets. The tokens (used in the passwordless authentication workflow), the users, and the tweets are all stored in a Neon database. Clients communicate with the database through REST API endpoints within an Express.js application stored in an Amazon EC2 instance.

(Expand more on the passwordless authentication workflow)

## Workflow to the Twitter Clone

(Demo the app)

## How?

1. Download the frontend and backend.
2. Create a development database and a production database.
3. Connect the backend to the two databases.
4. Use an email service and connect it to the backend.
5. Create a production backend on a separate server.
6. Connect the frontend to the two backends.

## Why?

The video series by notJust.dev seemed to be a great opportunity to increase my experiences working with the frontend and databases, and start developing skills working with a server and in fullstack development.

(Expand on this more)

## Future Plans?

First off, I plan to remove all the unnecessary files and code related to the Expo template this project started with. Afterwards, I plan to fix up the feed screen, the individual tweet screen and the new tweet screen. Once I polish the existing screens, I plan to add new screens related to adding, updating and deleting the user's details. After that, I plan to allow users to sign out of the application and to smooth out how authentication works under the hood. Finally, I plan to use uploadthing to implement the ability to add pictures to the app.

## Credits

1. Video Series
2. Expo
3. React-Query
4. dotenv tools
5. Drizzle ORM
6. Neon
7. Amazon AWS tools
8. Android Studio
9. Beekeeper Studio
10. Insomnia
11. PM2
12. React Native
13. React
14. TypeScript

(add links to the documentation)
