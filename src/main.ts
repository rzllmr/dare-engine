import { manager } from './engine/manager';
import { LoaderScene } from './game/scenes/loader';

manager.init().then(() => {
  manager.changeScene(new LoaderScene());
});
