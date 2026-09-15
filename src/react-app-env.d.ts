declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          alt?: string;
          'auto-rotate'?: boolean | string;
          'camera-controls'?: boolean | string;
          ar?: boolean | string;
          poster?: string;
          'rotation-per-second'?: string;
          'shadow-intensity'?: string | number;
          'shadow-softness'?: string | number;
          exposure?: string | number;
          'environment-image'?: string;
          'camera-orbit'?: string;
          'field-of-view'?: string;
          autoplay?: boolean | string;
          'animation-name'?: string;
          'ar-modes'?: string;
          'interaction-prompt'?: string;
          'touch-action'?: string;
          [key: string]: unknown;
        },
        HTMLElement
      >;
    }
  }
}
