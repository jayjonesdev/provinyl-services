import express, { Router, Response, Request } from 'express';
import { resolve } from 'path';
import { config } from 'dotenv';
import { Client as DiscogClient } from 'disconnect';
import { logger } from '../service';

config({ path: resolve(__dirname, '../../.env') });

const { CLIENT_URL, LOGIN_COOKIE_NAME, SERVICE_URL, DISCOGS_KEY, DISCOGS_SECRET } = process.env;

const auth: Router = express.Router();

let requestTokens: {
  id: string;
  requestData: any;
}[] = [];

const errorHandler = (err: any, req: any, res: any, next: any) => {
  // I use flash, but use whatever notification method you want for end users:
  req.flash('error', 'Error while trying to login: ' + err);
  res.redirect(`${CLIENT_URL}/Login`);
}

auth.get('/', (req: Request, res: Response) => res.redirect(`${CLIENT_URL}/Login`));

auth.get('/auth/discogs/:id', (req: Request, res: Response) => {
  const discogsOAuth = new DiscogClient().oauth();
  const id = req.params.id;

  discogsOAuth.getRequestToken(
    DISCOGS_KEY,
    DISCOGS_SECRET,
    `${SERVICE_URL}/auth/discogs/${id}/callback`,
    (err: any, requestData: IDiscgoOAuthRequestData) => {
      if (err) res.redirect(`${CLIENT_URL}/Login`);
      else {
        requestTokens.push({
          id,
          requestData
        });

        // Persist "requestData" here so that the callback handler can 
        // access it later after returning from the authorize url
        res.redirect(requestData.authorizeUrl);
      }
    }
  );
});

auth.get('/auth/discogs/:id/callback', (req: Request, res: Response) => {
  const id = req.params.id;
  const requestToken = requestTokens.find(token => token.id === id);
  const requestData = requestToken!.requestData;

  var oAuth = new DiscogClient(requestData).oauth();

  oAuth.getAccessToken(
    req.query.oauth_verifier, // Verification code sent back by Discogs
    (err: any, accessData: IDiscogOAuthAccessData) => {
      if (err) res.redirect(`${CLIENT_URL}/Login`);
      else {
        requestTokens = requestTokens.filter(token => token.id !== id);
// TODO: get oauth identity pass up username - store info somewhere

        res.cookie(LOGIN_COOKIE_NAME, JSON.stringify(accessData), {
          domain: process.env.COOKIE_DOMAIN,
          secure: process.env.COOKIE_SECURE === 'true' ? true : false,
          httpOnly: false,
          maxAge: (365 * 3) * 24 * 60 * 60 * 1000 // 3 years
        })
        res.redirect(`${CLIENT_URL}/Collection`);
      }
    }
  );
});





auth.get('/logout', (req: Request, res: Response) => {
  res.clearCookie(LOGIN_COOKIE_NAME);
  res.clearCookie(process.env.COOKIE_NAME);
  res.cookie(LOGIN_COOKIE_NAME, false, {
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.COOKIE_SECURE === 'true' ? true : false,
    httpOnly: false,
    maxAge: 1
  })
  res.send();
});

export default auth;

declare const process: {
  env: {
    CLIENT_URL: string;
    COOKIE_NAME: string;
    COOKIE_KEY: string;
    COOKIE_DOMAIN: string;
    COOKIE_HTTP_ONLY: string;
    COOKIE_SECURE: string;
    LOGIN_COOKIE_NAME: string;
    SERVICE_URL: string;
    DISCOGS_KEY: string;
    DISCOGS_SECRET: string;
  }
}

interface IDiscogOAuthAccessData {
  method: string;
  level: number;
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
}

interface IDiscgoOAuthRequestData {
  method: string;
  level: number;
  consumerKey: string;
  consumerSecret: string;
  token: string;
  tokenSecret: string;
  authorizeUrl: string;
}