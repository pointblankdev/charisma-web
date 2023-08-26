
export async function validateCaptchaResult(result: string): Promise<boolean> {
  const { success }: { success: boolean } = await fetch('https://hcaptcha.com/siteverify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `secret=${process.env.HCAPTCHA_SECRET_KEY}&response=${result}`
  }).then(res => res.json());

  return success;
}

export const IS_CAPTCHA_ENABLED = Boolean(process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY);
