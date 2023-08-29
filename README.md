# Wev React Components

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Video Component

- It will take one video as an input
- Also, it allows to trim that video using ffmpeg lib
- After trim, it will give the video URL or the video Blob object (whichever we can use in our case)
- Please note: Whenever we slide the slider to set start or end time, after 3 seconds it will call the function to trim the video

## Basic Code Understanding

- Everything is now under `App.tsx` file for easy access and use!
- App.tsx is being load from index.tsx file.
- On Load of the component, we are loading ffmpeg library via script (To use it with php code, we need to make sure it load the script correctly).
