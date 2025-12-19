import { ReactNode } from 'react';
import { componentFactory } from './componentFactory';

export type ComponentRendering = {
  componentName: string;
  fields?: Record<string, unknown>;
  params?: Record<string, string>;
  placeholders?: Record<string, ComponentRendering[]>;
};

export type PlaceholderData = ComponentRendering[] | undefined;

export function renderPlaceholder(
  placeholderName: string,
  components: PlaceholderData
): ReactNode {
  if (!components?.length) {
    return null;
  }

  return components.map((rendering, index) => renderComponent(rendering, `${placeholderName}-${index}`));
}

function renderComponent(rendering: ComponentRendering, key: string) {
  const Component = componentFactory(rendering.componentName);

  if (!Component) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Component '${rendering.componentName}' is not registered in the componentFactory.`);
    }
    return null;
  }

  return (
    <Component
      key={key}
      rendering={rendering}
      fields={rendering.fields}
      params={rendering.params}
      placeholders={rendering.placeholders}
    />
  );
}
