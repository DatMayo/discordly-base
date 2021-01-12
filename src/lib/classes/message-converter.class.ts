class MongoDBMessagesConverter {
  private _OUTPUT: Array<{ key: string; [lang: string]: string }>;

  constructor(messages: object, langKey: string = "DE") {
    this._OUTPUT = [];
    Object.keys(messages).forEach((messageSection) => {
      this._convertObj(messages, messageSection, "", langKey);
    });
  }

  get OUTPUT() {
    return this._OUTPUT;
  }

  private _convertObj(
    tree: object,
    key: string,
    path: string,
    targetLang: string = "DE"
  ) {
    if (tree.hasOwnProperty(key)) {
      if (typeof tree[key] == "object") {
        path += `${key}-`;
        Object.keys(tree[key]).forEach((subKeys) => {
          this._convertObj(tree[key], subKeys, path, targetLang);
        });
      } else {
        this._OUTPUT.push({
          key: `${path}${key}`,
          [targetLang]: tree[key],
        });
      }
    }
  }
}
