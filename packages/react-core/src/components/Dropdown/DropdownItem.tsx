import * as React from 'react';
import { InternalDropdownItemProps, InternalDropdownItem } from './InternalDropdownItem';
import { DropdownArrowContext } from './dropdownConstants';
import { useOUIAProps, OUIAProps } from '../../helpers';

export interface DropdownItemProps extends Omit<InternalDropdownItemProps, 'tabIndex'>, OUIAProps {
  /** Anything which can be rendered as dropdown item */
  children?: React.ReactNode;
  /** Classes applied to root element of dropdown item */
  className?: string;
  /** Class to be applied to list item */
  listItemClassName?: string;
  /**
   * A ReactElement to render, or a string to use as the component tag.
   * Example: component={<Link to="/components/alert/">Alert</Link>}
   * Example: component="button"
   * If React.isValidElement(component) the className prop will be injected unless styleChildren="false"
   */
  component?: React.ReactNode;
  /** ID for the component element */
  componentID?: string;
  /** Whether to set className on component when React.isValidElement(component) */
  styleChildren?: boolean;
  /** Render dropdown item as disabled option */
  isDisabled?: boolean;
  /** Render dropdown item as aria-disabled option */
  isAriaDisabled?: boolean;
  /** Render dropdown item as non-interactive item */
  isPlainText?: boolean;
  /** Default hyperlink location */
  href?: string;
  /** Tooltip to display when hovered over the item */
  tooltip?: React.ReactNode;
  /** Additional tooltip props forwarded to the Tooltip component */
  tooltipProps?: any;
  /** Additional node to include alongside item within the <li> */
  additionalChild?: React.ReactNode;
  /** Custom item rendering that receives the DropdownContext */
  customChild?: React.ReactNode;
  /** tabIndex to use, null to unset it */
  tabIndex?: number | null;
  /** An image to display within the DropdownItem, appearing before any component children */
  icon?: React.ReactNode;
  /** Initial focus on the item when the menu is opened (Note: Only applicable to one of the items) */
  autoFocus?: boolean;
  /** A short description of the dropdown item, displayed under the dropdown item content */
  description?: React.ReactNode;
  /** Value to overwrite the randomly generated data-ouia-component-id.*/
  ouiaId?: number | string;
  /** Set the value of data-ouia-safe. Only set to true when the component is in a static state, i.e. no animations are occurring. At all other times, this value must be false. */
  ouiaSafe?: boolean;
}

export const DropdownItem: React.FunctionComponent<DropdownItemProps> = ({
  children,
  className,
  component = 'a',
  isDisabled = false,
  isAriaDisabled = false,
  isPlainText = false,
  href,
  tooltip,
  tooltipProps = {},
  listItemClassName,
  onClick,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ref, // Types of Ref are different for React.FunctionComponent vs React.Component
  additionalChild,
  customChild,
  tabIndex = -1,
  icon = null,
  autoFocus,
  description = null,
  styleChildren,
  ouiaId,
  ouiaSafe,
  ...props
}: DropdownItemProps) => {
  const ouiaProps = useOUIAProps(DropdownItem.displayName, ouiaId, ouiaSafe);
  return (
    <DropdownArrowContext.Consumer>
      {context => (
        <InternalDropdownItem
          context={context}
          role="menuitem"
          tabIndex={tabIndex}
          className={className}
          component={component}
          isDisabled={isDisabled}
          isAriaDisabled={isAriaDisabled}
          isPlainText={isPlainText}
          href={href}
          tooltip={tooltip}
          tooltipProps={tooltipProps}
          listItemClassName={listItemClassName}
          onClick={onClick}
          additionalChild={additionalChild}
          customChild={customChild}
          icon={icon}
          autoFocus={autoFocus}
          styleChildren={styleChildren}
          description={description}
          {...ouiaProps}
          {...props}
        >
          {children}
        </InternalDropdownItem>
      )}
    </DropdownArrowContext.Consumer>
  );
};

DropdownItem.displayName = 'DropdownItem';
