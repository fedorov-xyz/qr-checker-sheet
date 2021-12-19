declare module '*.module.css' {
  const styleMap: { [localName: string]: string };
  export = styleMap;
  export default styleMap;
}
