import { IconBox, IconCode, IconDatabase, IconKey, IconZap, IconZapOff } from '@supabase/ui'
import React from 'react'
import { useState } from 'react'
import { Dropdown, Popover, Button, IconPlus, IconChevronDown, Select, Input, IconX } from 'ui'
import DatePickers from '../Settings/Logs/Logs.DatePickers'
import { REPORTS_DATEPICKER_HELPERS } from './Reports.constants'
import { ReportFilterItem } from './Reports.types'

interface Props {
  filters: ReportFilterItem[]
  onAddFilter: (filter: ReportFilterItem) => void
  onRemoveFilter: (filter: ReportFilterItem) => void
  onDatepickerChange: React.ComponentProps<typeof DatePickers>['onChange']
  datepickerTo?: string
  datepickerFrom?: string
}

const PRODUCT_FILTERS = [
  {
    key: 'rest',
    filterKey: 'request.path',
    filterValue: '/rest',
    label: 'REST',
    description: 'Requests made to PostgREST',
    icon: IconDatabase,
  },
  {
    key: 'auth',
    filterKey: 'request.path',
    filterValue: '/auth',
    label: 'Auth',
    description: 'Authentication and authorization requests',
    icon: IconKey,
  },
  {
    key: 'storage',
    filterKey: 'request.path',
    filterValue: '/storage',
    label: 'Storage',
    description: 'Storage asset requests',
    icon: IconBox,
  },
  {
    key: 'realtime',
    filterKey: 'request.path',
    filterValue: '/realtime',
    label: 'Realtime',
    description: 'Realtime connection requests',
    icon: IconZapOff,
  },
  // TODO: support functions once union parsing is fixed
  // {
  //   key: 'functions',
  //   filterKey: 'request.host',
  //   filterValue: '.functions.',
  //   label: 'Edge Functions',
  //   description: 'Edge function calls',
  //   icon: IconCode,
  // },
  {
    key: 'graphql',
    filterKey: 'request.path',
    filterValue: '/graphql',
    label: 'GraphQL',
    description: 'Requests made to pg_graphql',
    icon: IconCode,
  },
]

const ReportFilterBar: React.FC<Props> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onDatepickerChange,
  datepickerTo = '',
  datepickerFrom = '',
}) => {
  const filterKeys = ['request.path', 'request.host', 'response.status_code']
  const [showAdder, setShowAdder] = useState(false)
  const [currentProductFilter, setCurrentProductFilter] = useState<
    null | typeof PRODUCT_FILTERS[number]
  >(null)
  const [addFilterValues, setAddFilterValues] = useState<ReportFilterItem>({
    key: filterKeys[0],
    compare: 'is',
    value: '',
  })

  const resetFilterValues = () => {
    setAddFilterValues({
      key: filterKeys[0],
      compare: 'is',
      value: '',
    })
  }

  const handleProductFilterChange = async (
    productFilter: null | typeof PRODUCT_FILTERS[number]
  ) => {
    setCurrentProductFilter(productFilter)
    if (productFilter) {
      await onRemoveFilter({
        key: productFilter.filterKey,
        compare: 'matches',
        value: productFilter.filterValue,
      })
    }
    if (productFilter !== null) {
      await onAddFilter({
        key: productFilter.filterKey,
        compare: 'matches',
        value: productFilter.filterValue,
      })
    }
  }

  return (
    <div>
      <div className="flex flex-row justify-start items-center flex-wrap gap-2">
        <DatePickers
          onChange={onDatepickerChange}
          to={datepickerTo}
          from={datepickerFrom}
          helpers={REPORTS_DATEPICKER_HELPERS}
        />
        <Dropdown
          size="small"
          side="bottom"
          align="start"
          overlay={
            <>
              <Dropdown.Item onClick={() => handleProductFilterChange(null)}>
                All Requests
              </Dropdown.Item>
              <Dropdown.Separator />
              {PRODUCT_FILTERS.map((productFilter) => {
                const Icon = productFilter.icon
                return (
                  <Dropdown.Item
                    key={productFilter.key}
                    disabled={productFilter.key === currentProductFilter?.key}
                    onClick={() => handleProductFilterChange(productFilter)}
                    className="hover:bg-scale-600"
                    icon={<Icon size={24} />}
                  >
                    <span
                      className={[
                        productFilter.key === currentProductFilter?.key ? 'font-bold' : '',
                        'inline-block',
                      ].join(' ')}
                    >
                      {productFilter.label}
                    </span>
                    <span className=" text-left text-scale-1000 inline-block">
                      {productFilter.description}
                    </span>
                  </Dropdown.Item>
                )
              })}
            </>
          }
        >
          <Button
            as="span"
            type="default"
            className="inline-flex flex-row gap-2"
            iconRight={<IconChevronDown size={14} />}
          >
            {currentProductFilter === null ? 'All Requests' : currentProductFilter.label}
          </Button>
        </Dropdown>
        {filters
          .filter(
            (filter) =>
              filter.value !== currentProductFilter?.filterValue &&
              filter.key !== currentProductFilter?.filterKey
          )
          .map((filter) => (
            <div className="text-xs rounded border border-scale-1100 bg-scale-500 px-1 h-7 flex flex-row justify-center gap-1 items-center">
              {filter.key} {filter.compare} {filter.value}
              <Button
                type="text"
                size="tiny"
                className="!p-0 h-6 w-6 flex flex-row justify-center items-center"
                onClick={() => {
                  onRemoveFilter(filter)
                }}
                icon={<IconX size="tiny" className="text-scale-1100" />}
              >
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        <Popover
          align="end"
          header={
            <div className="flex justify-between items-center py-1">
              <h5 className="text-sm text-scale-1200">Add Filter</h5>

              <Button
                type="primary"
                size="tiny"
                onClick={() => {
                  onAddFilter(addFilterValues)
                  setShowAdder(false)
                  resetFilterValues()
                }}
              >
                Save
              </Button>
            </div>
          }
          open={showAdder}
          onOpenChange={(openValue) => setShowAdder(openValue)}
          overlay={[
            <div className="px-3 py-3 flex flex-col gap-2">
              <Select
                size="tiny"
                value={addFilterValues.key}
                onChange={(e) => {
                  setAddFilterValues((prev) => ({ ...prev, key: e.target.value }))
                }}
                label="Attribute Filter"
                defaultValue={'request.host'}
              >
                {filterKeys.map((key) => (
                  <Select.Option key={key} value={key}>
                    {key}
                  </Select.Option>
                ))}
              </Select>
              <Select
                size="tiny"
                value={addFilterValues.compare}
                onChange={(e) => {
                  setAddFilterValues((prev) => ({
                    ...prev,
                    compare: e.target.value as ReportFilterItem['compare'],
                  }))
                }}
                label="Comparison"
              >
                {['matches', 'is'].map((value) => (
                  <Select.Option key={value} value={value}>
                    {value}
                  </Select.Option>
                ))}
              </Select>
              <Input
                size="tiny"
                label="Value"
                onChange={(e) => {
                  setAddFilterValues((prev) => ({ ...prev, value: e.target.value }))
                }}
              />
            </div>,
          ]}
          showClose
        >
          <Button
            type="default"
            size="tiny"
            icon={<IconPlus size="tiny" className={`text-scale-1100 `} />}
          >
            Add filter
          </Button>
        </Popover>
      </div>
    </div>
  )
}
export default ReportFilterBar
