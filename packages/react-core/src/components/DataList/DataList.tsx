import * as React from 'react';
import { css } from '@patternfly/react-styles';
import styles from '@patternfly/react-styles/css/components/DataList/data-list';
import stylesGrid from '@patternfly/react-styles/css/components/DataList/data-list-grid';
import { PickOptional } from '../../helpers/typeUtils';

const gridBreakpointClasses = {
  none: stylesGrid.modifiers.gridNone,
  always: 'pf-m-grid', // Placeholder per https://github.com/patternfly/patternfly-react/issues/4965#issuecomment-704984236
  sm: stylesGrid.modifiers.gridSm,
  md: stylesGrid.modifiers.gridMd,
  lg: stylesGrid.modifiers.gridLg,
  xl: stylesGrid.modifiers.gridXl,
  '2xl': stylesGrid.modifiers.grid_2xl
};

export enum DataListWrapModifier {
  nowrap = 'nowrap',
  truncate = 'truncate',
  breakWord = 'breakWord'
}

export interface SelectableRowObject {
  /** Callback that executes when the screen reader accessible element receives a change event */
  onChange: (id: string, event: React.FormEvent<HTMLInputElement>) => void;
}

export interface DataListProps extends Omit<React.HTMLProps<HTMLUListElement>, 'ref'> {
  /** Content rendered inside the DataList list */
  children?: React.ReactNode;
  /** Additional classes added to the DataList list */
  className?: string;
  /** Adds accessible text to the DataList list */
  'aria-label': string;
  /** Optional callback to make DataList selectable, fired when DataListItem selected */
  onSelectDataListItem?: (id: string) => void;
  /** Id of DataList item currently selected */
  selectedDataListItemId?: string;
  /** Flag indicating if DataList should have compact styling */
  isCompact?: boolean;
  /** Specifies the grid breakpoints  */
  gridBreakpoint?: 'none' | 'always' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Determines which wrapping modifier to apply to the DataList */
  wrapModifier?: DataListWrapModifier | 'nowrap' | 'truncate' | 'breakWord';
  /** Object that causes the data list to render hidden inputs which improve selectable item a11y */
  selectableRow?: SelectableRowObject;
}

interface DataListContextProps {
  isSelectable: boolean;
  selectedDataListItemId: string;
  updateSelectedDataListItem: (id: string) => void;
  selectableRow?: SelectableRowObject;
}

export const DataListContext = React.createContext<Partial<DataListContextProps>>({
  isSelectable: false
});

export class DataList extends React.Component<DataListProps> {
  static displayName = 'DataList';
  static defaultProps: PickOptional<DataListProps> = {
    children: null,
    className: '',
    selectedDataListItemId: '',
    isCompact: false,
    gridBreakpoint: 'md',
    wrapModifier: null
  };
  ref = React.createRef<HTMLUListElement>();

  constructor(props: DataListProps) {
    super(props);
  }

  getIndex = (id: string) => Array.from(this.ref.current.children).findIndex(item => item.id === id);

  render() {
    const {
      className,
      children,
      onSelectDataListItem,
      selectedDataListItemId,
      isCompact,
      wrapModifier,
      gridBreakpoint,
      selectableRow,
      ...props
    } = this.props;
    const isSelectable = onSelectDataListItem !== undefined;

    const updateSelectedDataListItem = (id: string) => {
      onSelectDataListItem(id);
    };

    return (
      <DataListContext.Provider
        value={{
          isSelectable,
          selectedDataListItemId,
          updateSelectedDataListItem,
          selectableRow
        }}
      >
        <ul
          className={css(
            styles.dataList,
            isCompact && styles.modifiers.compact,
            gridBreakpointClasses[gridBreakpoint],
            wrapModifier && styles.modifiers[wrapModifier],
            className
          )}
          style={props.style}
          {...props}
          ref={this.ref}
        >
          {children}
        </ul>
      </DataListContext.Provider>
    );
  }
}
