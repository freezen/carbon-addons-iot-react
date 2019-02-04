import React, { Component } from 'react';
import PropTypes from 'prop-types';
import isNil from 'lodash/isNil';
import { Button, PaginationV2, DataTable, Checkbox } from 'carbon-components-react';
import { iconFilter } from 'carbon-icons';

import { defaultFunction } from '../../utils/componentUtilityFunctions';

import FilterHeaderRow from './FilterHeaderRow/FilterHeaderRow';

const {
  Table: CarbonTable,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarAction,
  TableCell,
} = DataTable;

const propTypes = {
  /** Array with objects (id, name and size) */
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      size: PropTypes.number.isRequired,
      filter: PropTypes.shape({
        placeholderText: PropTypes.string,
        options: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            text: PropTypes.string.isRequired,
          })
        ),
      }),
    })
  ).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      values: PropTypes.object,
    })
  ).isRequired,
  options: PropTypes.shape({
    hasPagination: PropTypes.bool,
    hasRowSelection: PropTypes.bool,
    hasFilter: PropTypes.bool,
  }),
  view: PropTypes.shape({
    pagination: PropTypes.shape({
      pageSizes: PropTypes.arrayOf(PropTypes.number),
      totalItems: PropTypes.number.isRequired,
      page: PropTypes.number.isRequired,
    }),
    filters: PropTypes.arrayOf(
      PropTypes.shape({
        columnId: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ),
    toolbar: PropTypes.shape({
      /** Specify which header row to display, will display default header row if null */
      activeBar: PropTypes.oneOf(['filter'], ['column']),
    }),
    table: PropTypes.shape({
      isSelectAllSelected: PropTypes.bool.isRequired,
      isSelectIndeterminate: PropTypes.bool,
      selectedIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  }),
  actions: PropTypes.shape({
    pagination: PropTypes.shape({
      /** Specify a callback for when the current page or page size is changed. This callback is passed an object parameter containing the current page and the current page size */
      onChange: PropTypes.func,
    }),
    toolbar: PropTypes.shape({
      onBatchCancel: PropTypes.func,
      onBatchDelete: PropTypes.func,
      onApplyFilter: PropTypes.func,
      onToggleFilter: PropTypes.func,
    }),
    table: PropTypes.shape({
      onRowSelected: PropTypes.func,
      onSelectAll: PropTypes.func,
    }).isRequired,
  }),
};

const defaultProps = {
  options: {},
  view: {
    pagination: { pageSizes: [10, 20, 30] },
    toolbar: {},
    table: {},
  },
  actions: {
    pagination: { onChange: defaultFunction },
    toolbar: {},
    table: {},
  },
}; // TBD

class Table extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render = () => {
    const { columns, data, view, actions, options } = this.props;
    const minItemInView = view.pagination
      ? (view.pagination.page - 1) * view.pagination.pageSize + 1
      : 0;
    const maxItemInView = view.pagination
      ? view.pagination.page * view.pagination.pageSize
      : data.length;
    const visibleData = data.slice(minItemInView, maxItemInView);
    const filterBarActive = options.hasFilter && view.toolbar.activeBar === 'filter';
    const filterBarActiveStyle = { paddingTop: 16 };
    const header = (
      <TableHead>
        <TableRow>
          {options.hasRowSelection ? (
            <TableHeader style={filterBarActive === true ? filterBarActiveStyle : {}}>
              {/* TODO: Replace checkbox with TableSelectAll component when onChange bug is fixed
              https://github.com/IBM/carbon-components-react/issues/1088 */}
              <Checkbox
                id="select-all"
                labelText="Select All"
                hideLabel
                indeterminate={view.table.isSelectIndeterminate}
                checked={view.table.isSelectAllSelected}
                onChange={() => actions.table.onSelectAll(!view.table.isSelectAllSelected)}
              />
            </TableHeader>
          ) : null}
          {columns.map(column => (
            <TableHeader
              key={`column-${column.id}`}
              style={filterBarActive === true ? filterBarActiveStyle : {}}>
              <span className="bx--table-header-label">{column.name}</span>
            </TableHeader>
          ))}
        </TableRow>
        {filterBarActive && (
          <FilterHeaderRow
            columns={columns.map(column => ({
              ...column.filter,
              id: column.id,
              isFilterable: !isNil(column.filter),
            }))}
            filters={view.filters}
            tableOptions={options}
            onApplyFilter={actions.toolbar.onApplyFilter}
          />
        )}
      </TableHead>
    );
    const body = (
      <TableBody>
        {visibleData.map(i => (
          <TableRow key={i.id}>
            {options.hasRowSelection ? (
              <TableCell>
                {/* TODO: Replace checkbox with TableSelectRow component when onChange bug is fixed
              https://github.com/IBM/carbon-components-react/issues/1088 */}
                <Checkbox
                  id={`select-row-${i.id}`}
                  labelText="Select Row"
                  hideLabel
                  checked={view.table.selectedIds.includes(i.id)}
                  onChange={() =>
                    actions.table.onRowSelected(i.id, !view.table.selectedIds.includes(i.id))
                  }
                />
              </TableCell>
            ) : null}
            {columns.map(col => (
              <TableCell key={col.id}>{i.values[col.id]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    );

    return (
      <div>
        {/* <Toolbar
          {...view.toolbar}
          selectedItemCount={view.table.selectedIds.length}
          {...actions.toolbar}
          hasFilters={view.filters && !!view.filters.length}
        /> */}
        <TableContainer title="DataTable with toolbar">
          <TableToolbar>
            <TableToolbarContent>
              {view.filters && !!view.filters.length ? ( // TODO: translate button
                <Button kind="secondary" onClick={() => defaultFunction} small>
                  Clear All Filters
                </Button>
              ) : null}
              <TableToolbarAction
                icon={iconFilter}
                iconDescription="Settings"
                onClick={actions.toolbar.onToggleFilter}
              />
            </TableToolbarContent>
          </TableToolbar>

          <CarbonTable zebra={false}>
            {header}
            {body}
          </CarbonTable>
        </TableContainer>

        {options.hasPagination ? (
          <PaginationV2 {...view.pagination} {...actions.pagination} />
        ) : null}
      </div>
    );
  };
}

Table.propTypes = propTypes;
Table.defaultProps = defaultProps;

export default Table;