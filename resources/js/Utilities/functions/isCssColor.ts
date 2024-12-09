/**
 * Taken from vuetify colorable mixin
 * https://github.com/vuetifyjs/vuetify/blob/master/packages/vuetify/src/mixins/colorable/index.ts
 */
export const isCssColor = (color: string): boolean => {
  return !!color && !!color.match(/^(#|var\(--|(rgb|hsl)a?\()/);
};
