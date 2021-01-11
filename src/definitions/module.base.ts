export const MODULES: Record<string, any> = {};
export class BaseModule {
  disabled: boolean = false;
  name: string = "module" + new Date().getTime();

  disable(): void {
    this.disabled = true;
    console.info(`${this.name}-Module disabled`);
  }
  enable(): void {
    this.disabled = false;
    console.info(`${this.name}-Module enabled`);
  }

  init(): void {
    console.info(`${this.name}-Module loaded & activated`);
  }
}
