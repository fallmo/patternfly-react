import React from 'react';
import { Dropdown, DropdownToggle, DropdownItem, DropdownSeparator, DropdownDirection } from '@patternfly/react-core';

export const DropdownDirectionUp: React.FunctionComponent = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggle = (_event: any, isOpen: boolean) => {
    setIsOpen(isOpen);
  };

  const onFocus = () => {
    const element = document.getElementById('toggle-direction-up');
    element?.focus();
  };

  const onSelect = () => {
    setIsOpen(false);
    onFocus();
  };

  const dropdownItems = [
    <DropdownItem key="link">Link</DropdownItem>,
    <DropdownItem key="action" component="button">
      Action
    </DropdownItem>,
    <DropdownItem key="disabled link" isDisabled href="www.google.com">
      Disabled link
    </DropdownItem>,
    <DropdownItem
      key="disabled action"
      isAriaDisabled
      component="button"
      tooltip="Tooltip for disabled item"
      tooltipProps={{ position: 'top' }}
    >
      Disabled action
    </DropdownItem>,
    <DropdownSeparator key="separator" />,
    <DropdownItem key="separated link">Separated link</DropdownItem>,
    <DropdownItem key="separated action" component="button">
      Separated action
    </DropdownItem>
  ];

  return (
    <Dropdown
      onSelect={onSelect}
      direction={DropdownDirection.up}
      toggle={
        <DropdownToggle id="toggle-direction-up" onToggle={onToggle}>
          Dropdown
        </DropdownToggle>
      }
      isOpen={isOpen}
      dropdownItems={dropdownItems}
    />
  );
};
