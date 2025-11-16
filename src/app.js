import express from 'express';
import mustacheExpress from 'mustache-express';
import bodyParser from 'body-parser';


import router from './router.js';
import './load_data.js';

const app = express();

app.use(express.static('./public'));

app.set('view engine', 'html');
app.set('views', './views');

app.engine('html', mustacheExpress(), ".html");

app.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

app.listen(3000, () => console.log('Web ready in http://localhost:3000/'));
