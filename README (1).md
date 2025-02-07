---
description: >-
  This endpoint provides detailed information on liquidity vaults (pools) and
  tokens. It’s built using the Dexterity SDK and applies a blacklist to filter
  out unwanted contracts.
---

# Liquidity Pools & Tokens API

### Endpoint Details

* **URL:**\
  `GET https://charisma.rocks/api/v0/dexterity/vaults`
* **Method:**\
  `GET`
* **Headers:**\
  `Content-Type: application/json`
* **Body:**\
  &#xNAN;_&#x4E;one required._

> **Note:** Only `GET` is allowed; other methods return a **405 Method Not Allowed**.

***

### Response Structure

The JSON response always has a `success` flag and a `data` object:

```json
{
  "success": true,
  "data": {
    "vaults": [ ... ],
    "tokens": [ ... ]
  }
}
```

* **success**: Boolean indicating if the request succeeded.
* **data**: Object containing:
  * **vaults**: An array of liquidity vault objects.
  * **tokens**: An array of token metadata objects.

***

### Vault Object Schema

Each vault object contains:

* **contractId** _(String)_: Unique vault contract identifier.
* **name** _(String)_: Name of the vault.
* **symbol** _(String)_: Vault token symbol.
* **decimals** _(Number)_: Decimal precision.
* **identifier** _(String)_: Short vault identifier.
* **description** _(String)_: Description of the vault.
* **image** _(String)_: URL to the vault’s image.
* **fee** _(Number)_: Fee (likely in basis points).
* **liquidity** _(Array)_: List of tokens that make up the vault:
  * Each liquidity item has:
    * **contractId** _(String)_: Token contract ID.
    * **identifier** _(String)_: Token identifier.
    * **name** _(String)_: Token name.
    * **symbol** _(String)_: Token symbol.
    * **decimals** _(Number)_: Decimal precision.
    * **description** _(String)_: Token description.
    * **image** _(String)_: Token image URL.
    * **reserves** _(Number)_: Token reserves in the pool.
* **supply** _(Number)_: Total supply of the vault token.
* **externalPoolId** _(String)_: Optional external identifier.
* **engineContractId** _(String)_: Optional engine contract ID.

***

### Token Object Schema

Each token object includes:

* **contractId** _(String)_: Unique token contract ID.
* **name** _(String)_: Token name.
* **symbol** _(String)_: Token symbol.
* **decimals** _(Number)_: Decimal precision.
* **identifier** _(String)_: Short token identifier.
* **description** _(String)_: Token description.
* **image** _(String)_: URL to the token’s image.

***

### Example Request

```bash
curl https://charisma.rocks/api/v0/dexterity/vaults
```

***

### Example Response

Below is a truncated sample response:

```json
{
  "success": true,
  "data": {
    "vaults": [
      {
        "contractId": "SP2D5BGGJ956A635JG7CJQ59FTRFRB0893514EZPJ.age-of-empires",
        "name": "Age of Empires",
        "symbol": "AOE",
        "decimals": 6,
        "identifier": "AOE",
        "description": "Liquidity vault for the USDh-CHA trading pair",
        "image": "https://kghatiwehgh3dclz.public.blob.vercel-storage.com/aoe-RaIAEAGz8asYZg95fj2gTX8UKlh4Xm.jpeg",
        "fee": 10000,
        "liquidity": [
          {
            "contractId": "SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1",
            "identifier": "usdh",
            "name": "Hermetica USDh",
            "symbol": "USDh",
            "decimals": 8,
            "description": "Hermetica USDh",
            "image": "https://assets.hermetica.fi/usdh_logo.svg",
            "reserves": 561983632
          },
          {
            "contractId": "SP2ZNGJ85ENDY6QRHQ5P2D4FXKGZWCKTB2T0Z55KS.charisma-token",
            "identifier": "charisma",
            "name": "Charisma",
            "symbol": "CHA",
            "decimals": 6,
            "description": "The primary token of the Charisma ecosystem.",
            "image": "https://charisma.rocks/charisma-logo-square.png",
            "reserves": 8906881
          }
        ],
        "supply": 10000000,
        "externalPoolId": "",
        "engineContractId": ""
      }
      // ... other vaults
    ],
    "tokens": [
      {
        "contractId": "SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1",
        "name": "Hermetica USDh",
        "symbol": "USDh",
        "decimals": 8,
        "identifier": "usdh",
        "description": "Hermetica USDh",
        "image": "https://assets.hermetica.fi/usdh_logo.svg"
      }
      // ... other tokens
    ]
  }
}
```

***

### Error Responses

*   **405 Method Not Allowed**

    Returned if a method other than GET is used.

    ```json
    { "error": "Method not allowed" }
    ```
*   **500 Internal Server Error**

    Returned when an error occurs while fetching data.

    ```json
    { "success": false, "error": "Failed to fetch vault data" }
    ```

