import { NextApiRequest, NextApiResponse } from 'next';

type ErrorResponse = {
    error: {
        code: string;
        message: string;
    };
};

export default function InteractionAPI(
    req: NextApiRequest,
    res: NextApiResponse<any | ErrorResponse>
) {
    return res.status(200).json({
        url: "https://charisma.rocks/interactions/SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.keepers-petition-rc1",
        image: "https://charisma.rocks/interactions/keepers-petition.png",
        name: "Keepers' Petition",
        subtitle: "Petition the Dungeon Keeper for token rewards.",
        description: [
            "The Keepers' Petition is a configurable mechanism that allows players to request DMG tokens from designated sources within the game. By spending energy, players can petition for rewards from addresses chosen by the Dungeon Keepers.",
            "This flexible system can serve multiple strategic purposes in the game economy - from distributing treasury rewards to implementing complex reward and consequence mechanics. The source of tokens and reward amounts can be dynamically adjusted by the Keepers to serve different gameplay objectives.",
            "To participate, players must spend Fatigue (energy) to make their petition. If successful, they will receive DMG tokens from the currently configured source address. The reward amount is variable and can be adjusted by the Keepers to maintain game balance.",
            "The contract features a robust administrative system allowing multiple Keepers to manage the interaction, update token sources, and adjust reward amounts. This distributed control ensures sustainable operation of the reward system while maintaining security through energy-gating and proper authorization checks."
        ],
        contract: "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.keepers-petition-rc1",
        category: "Rewards",
        actions: ["PETITION"]
    });
}