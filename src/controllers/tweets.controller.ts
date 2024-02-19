import { NextFunction, Request, Response } from 'express'
import { CreateTweetRequestBody } from '~/models/requests/Tweet.request'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import tweetsServices from '~/services/tweet.services'
import { TWEET_MESSAGE } from '~/constants/messages'

export const createTweetController = async (
  req: Request<ParamsDictionary, any, CreateTweetRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await tweetsServices.createTweet(user_id, req.body)
  res.json({
    message: TWEET_MESSAGE.CREATE_TWEET_SUCCESSFUL,
    result
  })
}
