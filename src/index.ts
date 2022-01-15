import express from 'express';
import config from './config/config';

const app = express();

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

app.listen(config.port, () => {
  console.log(`Listening to port ${config.port}`);
});
