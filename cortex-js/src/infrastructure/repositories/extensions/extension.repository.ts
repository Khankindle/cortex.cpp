import { Inject, Injectable } from '@nestjs/common';
import { ExtensionRepository } from '@/domain/repositories/extension.interface';
import { Extension } from '@/domain/abstracts/extension.abstract';
import { readdir, lstat, access } from 'fs/promises';
import { join } from 'path';
import { EngineExtension } from '@/domain/abstracts/engine.abstract';

@Injectable()
export class ExtensionRepositoryImpl implements ExtensionRepository {
  // Initialize the Extensions Map with the key-value pairs of the core providers.
  extensions = new Map<string, Extension>([['cortex', this.cortexProvider]]);

  constructor(
    @Inject('CORTEX_PROVIDER')
    private readonly cortexProvider: EngineExtension,
  ) {
    this.loadCoreExtensions();
    this.loadExternalExtensions();
  }
  create(object: Extension): Promise<Extension> {
    this.extensions.set(object.name ?? '', object);
    return Promise.resolve(object);
  }
  findAll(): Promise<Extension[]> {
    return Promise.resolve(Array.from(this.extensions.values()));
  }
  findOne(id: string): Promise<Extension | null> {
    return Promise.resolve(this.extensions.get(id) ?? null);
  }
  update(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  remove(id: string): Promise<void> {
    this.extensions.delete(id);
    return Promise.resolve();
  }

  loadCoreExtensions(): void {
    const extensionsPath = join(__dirname, './../../../extensions');
    this.loadExtensions(extensionsPath);
  }

  loadExternalExtensions(): void {
    const extensionsPath = process.env.EXTENSIONS_PATH ?? 'extensions';
    this.loadExtensions(extensionsPath);
  }

  private async loadExtensions(extensionsPath: string) {
    if (
      !(await access(extensionsPath)
        .then(() => true)
        .catch(() => false))
    )
      return;

    readdir(extensionsPath).then((files) => {
      files.forEach(async (extension) => {
        if (!(await lstat(`${extensionsPath}/${extension}`)).isDirectory())
          return;

        import(`${extensionsPath}/${extension}`).then((extensionClass) => {
          const newExtension = new extensionClass.default();
          this.extensions.set(extension, newExtension);
        });
      });
    });
  }
}