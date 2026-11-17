interface StorageEntry {
  name: string;
  id: string | null;
}

export interface CleanupBucket {
  list: (prefix: string, offset: number, limit: number) => Promise<{ data: StorageEntry[] | null; error: { message: string } | null }>;
  remove: (paths: string[]) => Promise<{ error: { message: string } | null }>;
}

/** Removes every object under one account prefix, including nested folders. */
export async function removeUserStorage(bucket: CleanupBucket, userId: string): Promise<void> {
  const limit = 100;
  for (let pass = 0; pass < 10; pass++) {
    const folders = [userId];
    const files: string[] = [];
    for (let i = 0; i < folders.length; i++) {
      if (folders.length > 10000 || files.length > 100000) throw new Error('Account storage is too large to delete automatically.');
      const prefix = folders[i];
      let offset = 0;
      while (true) {
        const { data, error } = await bucket.list(prefix, offset, limit);
        if (error || !data) throw new Error(error?.message ?? 'Could not list account storage.');
        for (const entry of data) {
          if (!entry.name || entry.name === '.' || entry.name === '..' || entry.name.includes('/') || entry.name.includes('\\')) {
            throw new Error('Account storage contains an invalid object name.');
          }
          const path = `${prefix}/${entry.name}`;
          if (path.length > 1024) throw new Error('Account storage contains an excessively deep path.');
          if (entry.id === null) folders.push(path);
          else files.push(path);
          if (folders.length > 10000 || files.length > 100000) throw new Error('Account storage is too large to delete automatically.');
        }
        if (data.length < limit) break;
        offset += data.length;
      }
    }
    if (files.length === 0) return;
    for (let i = 0; i < files.length; i += limit) {
      const { error } = await bucket.remove(files.slice(i, i + limit));
      if (error) throw new Error(error.message);
    }
  }
  throw new Error('Account storage kept changing during deletion. Please retry.');
}
