import { Bindings } from "@/app";
import { B2AuthorizeAccount, B2GetUploadUrl, B2UploadFile } from "@/models";
import { Context } from "hono";
import { createId } from "@paralleldrive/cuid2";

export class Bucket {
  private static readonly B2_BASE_URL = "https://api.backblazeb2.com";
  private c: Context<{ Bindings: Bindings }>;

  constructor(c: Context) {
    this.c = c;
  }

  private async fetchApiUrl() {
    const { B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY } = this.c.env;

    const res = await fetch(
      `${Bucket.B2_BASE_URL}/b2api/v2/b2_authorize_account`,
      {
        headers: {
          Authorization: `Basic ${btoa(
            B2_APPLICATION_KEY_ID + ":" + B2_APPLICATION_KEY
          )}`,
        },
      }
    );

    if (!res.ok) throw new Error("Erro ao conectar com o Bucket");

    return B2AuthorizeAccount.parse(await res.json());
  }

  private async fetchUploadUrl() {
    const {
      apiUrl,
      authorizationToken,
      allowed: { bucketId },
    } = await this.fetchApiUrl();

    const res = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
      method: "post",
      headers: {
        Authorization: authorizationToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucketId,
      }),
    });

    if (!res.ok) throw new Error("Erro ao fazer upload do arquivo");

    return B2GetUploadUrl.parse(await res.json());
  }

  async upload(file: File) {
    const { uploadUrl, authorizationToken } = await this.fetchUploadUrl();

    const imageExt = file.name.split(".").reverse()[0];

    const res = await fetch(uploadUrl, {
      method: "post",
      headers: {
        Authorization: authorizationToken,
        "Content-Length": file.size.toString(),
        "X-Bz-File-Name": `${createId()}.${imageExt}`,
        "X-Bz-Content-Sha1": "do_not_verify",
      },
      body: file,
    });

    if (!res.ok) throw new Error("Erro ao fazer upload do arquivo");

    return B2UploadFile.parse(await res.json());
  }

  async download(fileId: string) {
    const { downloadUrl, authorizationToken } = await this.fetchApiUrl();

    const query = new URLSearchParams({ fileId });

    const res = await fetch(
      `${downloadUrl}/b2api/v2/b2_download_file_by_id?${query.toString()}`,
      {
        headers: {
          Authorization: authorizationToken,
        },
      }
    );

    if (!res.ok) throw new Error("Erro ao buscar o arquivo");

    return await res.blob();
  }
}
