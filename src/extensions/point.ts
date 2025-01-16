import type { PointData } from 'pixi.js';
import { Point, ObservablePoint } from 'pixi.js';

declare module "pixi.js" {
  interface Point {
    round<T extends PointData>(outPoint?: T): T;
  }
  interface ObservablePoint {
    round<T extends PointData>(outPoint?: T): T;
    clonePoint<T extends PointData>(): T;
  }
}

const both: any = {
  round<T extends PointData>(outPoint?: T): T
  {
    if (!outPoint) (outPoint as any) = new Point();
    if (!outPoint) return (new Point() as any);

    outPoint.x = Math.round(this.x);
    outPoint.y = Math.round(this.y);

    return outPoint;
  }
}
const observable: any = {
  clonePoint(): Point
  {
    return new Point(this._x, this._y);
  }
}

Object.assign(Point.prototype, both);
Object.assign(ObservablePoint.prototype, both, observable);
