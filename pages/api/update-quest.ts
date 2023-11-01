import { NextApiRequest, NextApiResponse } from 'next';
import { ConfUser } from '@lib/types';
import { createFromUrl, updateQuest } from '@lib/db-providers/dato';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default async function updateQuestApi(
    req: NextApiRequest,
    res: NextApiResponse<ConfUser | ErrorResponse>
) {

    let response, uploadResponse, updateResponse, code = 200
    try {

        if (req.body.cardImage) {

            uploadResponse = await createFromUrl({ url: req.body.cardImage })
            console.log({ uploadResponse })
            delete req.body.cardImage

            updateResponse = await updateQuest({ id: req.body.id, card_image: { upload_id: uploadResponse.id } })
            console.log({ updateResponse })
        }

        response = await updateQuest({ ...req.body })
    } catch (error: any) {
        console.error(error)
        response = new Object(error)
        code = error.response.status
    }

    return res.status(code).json(response);
}
