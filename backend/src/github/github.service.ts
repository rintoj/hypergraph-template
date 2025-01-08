import { Injectable } from '@nestjs/common';
import { GithubContent } from './github.model';

@Injectable()
export class GithubService {
  async fetchFromGithub(
    ownerId: string,
    repository: string,
    path?: string,
  ): Promise<GithubContent[]> {
    const response = await fetch(
      `https://api.github.com/repos/${ownerId}/${repository}/contents${path ? `/${path}` : ''}`,
      { headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } },
    );
    const output = await response.json();
    if (Array.isArray(output)) return output;
    return [output];
  }

  async fetchRecursivelyFromGithub(
    ownerId: string,
    repository: string,
    path?: string,
  ) {
    const contents = await this.fetchFromGithub(ownerId, repository, path);
    const files = await Promise.all(
      contents.map(async (content): Promise<GithubContent[]> => {
        if (content.type === 'dir') {
          return this.fetchRecursivelyFromGithub(
            ownerId,
            repository,
            content.path,
          );
        } else if (content.type === 'file') {
          const files = await this.fetchFromGithub(
            ownerId,
            repository,
            content.path,
          );
          return files.map((file) => ({
            ...file,
            content: Buffer.from(file.content, 'base64').toString('utf-8'),
          }));
        }
      }),
    );
    return files.flat();
  }
}
