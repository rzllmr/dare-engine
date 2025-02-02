import diaryTemplate from "templates/diary.hbs";
import infoTemplate from "templates/info.hbs";
import itemsTemplate from "templates/items.hbs";
import optionsTemplate from "templates/options.hbs";

export class Page {
  private readonly _html = '';

  constructor(kind: string) {
    switch(kind) {
      case 'diary':
          this._html = diaryTemplate();
          break;
      case 'info':
          this._html = infoTemplate({ tab: kind });
          break;
      case 'items':
          this._html = itemsTemplate();
          break;
      case 'options':
          this._html = optionsTemplate({ tab: kind });
          break;
    }
  }

  public get html(): string {
    return this._html;
  }  
}
