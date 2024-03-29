import { NextFunction, Request, Response } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { TokenPayload } from '~/models/requests/User.requests'
import { BOOKMARK_MESSAGE } from '~/constants/messages'
import { CreateBookmarkRequestBody, DeleteBookmarkRequestParams } from '~/models/requests/Bookmark.request'
import bookmarkServices from '~/services/bookmark.services'

export const createBookmarkController = async (
  req: Request<ParamsDictionary, any, CreateBookmarkRequestBody>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  const result = await bookmarkServices.createBookmark(user_id, req.body.tweet_id)
  res.json({
    message: BOOKMARK_MESSAGE.CREATE_BOOKMARK_SUCCESSFUL,
    result
  })
}

export const deleteBookmarkController = async (
  req: Request<DeleteBookmarkRequestParams>,
  res: Response,
  next: NextFunction
) => {
  const { user_id } = req.decoded_authorization as TokenPayload
  await bookmarkServices.deleteBookmark(user_id, req.params.tweet_id)
  res.json({
    message: BOOKMARK_MESSAGE.DELETE_BOOKMARK_SUCCESSFUL
  })
}
