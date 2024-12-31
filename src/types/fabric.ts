import { Canvas as FabricCanvas, Object as FabricObject } from "fabric";

export interface ExtendedCanvas extends FabricCanvas {
  clipboard?: FabricObject;
}

export interface ExtendedFabricObject extends FabricObject {
  canvas?: FabricCanvas;
  forEachObject?: (callback: (obj: FabricObject) => void) => void;
}

export interface EnlivenObjectOptions {
  reviver?: (obj: any) => void;
  namespace?: any;
}