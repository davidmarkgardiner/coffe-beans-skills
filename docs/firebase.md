To set up Firebase for a Node.js app using shadcn UI for inventory management and user authentication, you’ll need to create a Firebase project, configure Firestore for inventory storage, and integrate Firebase Authentication for user login features. Below is a practical, step-by-step guide based on current industry resources:

### Project Setup Steps

1. **Create Your Firebase Project**  
   Go to the Firebase Console, create a new project, and register your app as a web application.[1][2][3]

2. **Configure Firebase in Node.js**  
   Install Firebase SDK using:
   ```
   npm install firebase firebase-admin
   ```
   Download your service account JSON from Firebase, and initialize Firebase Admin in your backend code:
   ```js
   const admin = require('firebase-admin');
   const serviceAccount = require("./firebaseService.json");
   admin.initializeApp({
     credential: admin.credential.cert(serviceAccount),
   });
   ```
   For the frontend, add your Firebase config as environment variables (for example, in `.env.local`):
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=xxx
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   NEXT_PUBLIC_FIREBASE_APP_ID=xxx
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=xxx
   ```
   Then initialize Firebase in your client code as per the config.[2][4][3]

### User Authentication

- **Enable Email/Password and Social Auth**  
  In Firebase Console, go to Authentication > Sign-in Method, and enable email/password (and optionally, Google/GitHub if desired).[4][5][2]
- **Frontend Integration (shadcn UI)**  
  Use shadcn UI components for your sign-in forms. There are open-source templates and boilerplates available to kickstart combining Next.js, Firebase Auth, and shadcn UI.[6][7][4]
- **Server Validation**  
  On protected routes, validate user tokens using Firebase Admin’s `verifyIdToken` method to secure endpoints.[8][9]

### Inventory Management (Firestore Integration)

- **Enable Firestore in Firebase Console**  
  Set up Firestore as your database for storing inventory items.[3][10]
- **CRUD Operations Example**  
  Implement add, update, delete, and query operations in your Node.js backend using Firestore:
   ```js
   const db = admin.firestore();
   // Add item
   async function addItem(item) {
     return await db.collection('inventory').add(item);
   }
   // Get items
   async function getItems() {
     const snapshot = await db.collection('inventory').get();
     return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
   }
   ```
- Use shadcn UI components or templates to build the frontend inventory table and forms, leveraging Firestore’s real-time capabilities and Firebase Auth for access control.[11][10][12][3]

### Reference Templates

- There are several open-source templates that combine Next.js, Firebase, shadcn UI, and authentication—these can rapidly accelerate your setup:
  - [Next.js Shadcn Firebase Auth Boilerplate][4]
  - [Minimal React Firebase Auth with Shadcn/Tailwind][6]
  - [Inventory Manager app with Next.js, Firebase, Material-UI][3]
  - [Firebase Templates with shadcn/ui][12][7][11]

### Deployment

- For cloud deployment (e.g., on Vercel), update environment variables and follow standard Vercel deployment steps for Next.js apps.[3]

***

Each step above is directly applicable to Node.js with shadcn UI and leverages proven methodologies and boilerplates supported by active developer communities. This will set up your inventory management with secure authentication and scalable database operations, integrated with modern UI.[11][4][6][3]

[1](https://firebase.google.com/docs/web/setup)
[2](https://permify.co/post/firebase-authentication-nodejs/)
[3](https://github.com/FalakR/Inventory_Manager)
[4](https://github.com/ln-dev7/next-shadcn-firebase-auth-boilerplate)
[5](https://firebase.google.com/docs/auth/web/start)
[6](https://www.reddit.com/r/reactjs/comments/1k8arhf/i_built_a_minimal_react_firebase_authentication/)
[7](https://github.com/EthanL06/nextjs-shadcn-tailwind-framer-firebase-starter)
[8](https://stackoverflow.com/questions/59234481/how-to-handle-firebase-auth-from-mobile-app-and-node-api)
[9](https://itnext.io/how-to-use-firebase-auth-with-a-custom-node-backend-99a106376c8a)
[10](https://www.freecodecamp.org/news/nodejs-and-cloud-firestore-tutorial-build-a-home-inventory-system/)
[11](https://www.shadcn.io/template/category/firebase)
[12](https://makerkit.dev/docs/next-fire/ui/shadcn)
[13](https://www.aegissofttech.com/insights/setup-firebase-authentication-in-nodejs/)
[14](https://firebase.google.com/docs/web/alt-setup)
[15](https://www.youtube.com/watch?v=LCTJLrFeVPc)
[16](https://www.youtube.com/watch?v=m_077MN0p8M)
[17](https://www.youtube.com/watch?v=U0fJMmaKaMU)
[18](https://www.reddit.com/r/Firebase/comments/1k8aslz/react_firebase_authentication_template_with/)
[19](https://dzone.com/articles/building-a-food-inventory-management-app)
[20](https://stackoverflow.com/questions/61838962/firebase-authentication-with-react-and-node)