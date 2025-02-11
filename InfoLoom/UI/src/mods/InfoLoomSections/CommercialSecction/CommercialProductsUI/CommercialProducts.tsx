import React, { useState, useCallback, FC } from 'react';

import $Panel from 'mods/panel';
import { Button, Dropdown, DropdownToggle } from 'cs2/ui';
import { InfoCheckbox } from 'mods/InfoCheckbox/InfoCheckbox';
import { getModule } from "cs2/modding";
import styles from './CommercialProducts.module.scss';
import { ResourceIcon } from './resourceIcons';
import { formatWords } from 'mods/InfoLoomSections/utils/formatText';
import {bindValue, useValue} from "cs2/api";
import mod from "mod.json";

const DropdownStyle = getModule("game-ui/menu/themes/dropdown.module.scss", "classes");

interface CommercialProductData {
  ResourceName: string;
  Demand: number;
  Building: number;
  Free: number;
  Companies: number;
  SvcPercent: number;
  CapPerCompany: number;
  CapPercent: number;
  Workers: number;
  WrkPercent: number;
  TaxFactor: number;
  
}
const CommercialProduct$ = bindValue<CommercialProductData[]>(mod.id, "commercialProducts", []);
interface CommercialProps {
  onClose: () => void;
}

type ShowColumnsType = {
  demand: boolean;
  service: boolean;
  capacity: boolean;
  workers: boolean;
  tax: boolean;
};

interface ResourceLineProps {
  data: CommercialProductData;
  showColumns: ShowColumnsType;
}

const ResourceLine: React.FC<ResourceLineProps> = ({ data, showColumns }) => {
  // Use the display name mapping if available
  const displayName = data.ResourceName === 'Ore' ? 'MetalOre' : 
                     data.ResourceName === 'Oil' ? 'CrudeOil' : 
                     data.ResourceName;
  const formattedResourceName = formatWords(displayName, true);
  
  return (
    <div className={styles.row_S2v}>
      <div className={styles.cell} style={{ width: '3%' }}></div>
      <div className={styles.cell} style={{ width: '15%', justifyContent: 'flex-start', gap: '8px' }}>
        <ResourceIcon resourceName={data.ResourceName} />
        <span>{formattedResourceName}</span>
      </div>
      {showColumns.demand && (
        <>
          <div className={`${styles.cell} ${data.Demand < 0 ? styles.negative_YWY : ''}`} style={{ width: '6%' }}>
            {data.Demand}
          </div>
          <div className={`${styles.cell} ${data.Building <= 0 ? styles.negative_YWY : ''}`} style={{ width: '4%' }}>
            {data.Building}
          </div>
          <div className={`${styles.cell} ${data.Free <= 0 ? styles.negative_YWY : ''}`} style={{ width: '4%' }}>
            {data.Free}
          </div>
          <div className={styles.cell} style={{ width: '5%' }}>
            {data.Companies}
          </div>
        </>
      )}
      {showColumns.service && (
        <div className={`${styles.cell} ${data.SvcPercent > 50 ? styles.negative_YWY : ''}`} style={{ width: '12%' }}>
          {`${data.SvcPercent}%`}
        </div>
      )}
      {showColumns.capacity && (
        <>
          <div className={styles.cell} style={{ width: '10%' }}>
            {data.CapPerCompany}
          </div>
          <div className={`${styles.cell} ${data.CapPercent > 200 ? styles.negative_YWY : ''}`} style={{ width: '10%' }}>
            {`${data.CapPercent}%`}
          </div>
        </>
      )}
      {showColumns.workers && (
        <>
          <div className={styles.cell} style={{ width: '9%' }}>
            {data.Workers}
          </div>
          <div className={`${styles.cell} ${data.WrkPercent < 90 ? styles.negative_YWY : styles.positive_zrK}`} style={{ width: '9%' }}>
            {`${data.WrkPercent}%`}
          </div>
        </>
      )}
      {showColumns.tax && (
        <div className={`${styles.cell} ${data.TaxFactor < 0 ? styles.negative_YWY : ''}`} style={{ width: '12%' }}>
          {data.TaxFactor}
        </div>
      )}
    </div>
  );
};

const TableHeader: React.FC<{ showColumns: ShowColumnsType }> = ({ showColumns }) => {
  return (
    <div className={styles.headerRow}>
      <div className={styles.headerCell} style={{ width: '3%' }}></div>
      <div className={styles.headerCell} style={{ width: '15%' }}>
        Resource
      </div>
      {showColumns.demand && (
        <>
          <div className={styles.headerCell} style={{ width: '6%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span>Resource</span>
            <span>Demand</span>
          </div>
          <div className={styles.headerCell} style={{ width: '4%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span>Zone</span>
            <span>Demand</span>
          </div>
          <div className={styles.headerCell} style={{ width: '4%' }}>Free</div>
          <div className={styles.headerCell} style={{ width: '5%' }}>Num</div>
        </>
      )}
      {showColumns.service && (
        <div className={styles.headerCell} style={{ width: '12%' }}>Service</div>
      )}
      {showColumns.capacity && (
        <>
          <div className={styles.headerCell} style={{ width: '20%' }}>Household Need</div>
        </>
      )}
      {showColumns.workers && (
        <>
          <div className={styles.headerCell} style={{ width: '9%' }}>Workers</div>
          <div className={styles.headerCell} style={{ width: '9%' }}>Work%</div>
        </>
      )}
      {showColumns.tax && (
        <div className={styles.headerCell} style={{ width: '12%' }}>Tax</div>
      )}
    </div>
  );
};
interface CommercialProps {
  onClose: () => void
}
const $CommercialProducts: FC<CommercialProps> = ({ onClose }) => {
  
  const commercialProducts = useValue(CommercialProduct$);
      
  
  

  const [showColumns, setShowColumns] = useState<ShowColumnsType>({
    demand: true,
    service: true,
    capacity: true,
    workers: true,
    tax: true,
  });

  const [sortBy, setSortBy] = useState<'name' | 'demand' | 'workers' | 'tax'>('name');
  const [filterDemand, setFilterDemand] = useState<'all' | 'positive' | 'negative'>('all');

  const toggleColumn = useCallback((column: keyof ShowColumnsType) => {
    setShowColumns(prev => ({
      ...prev,
      [column]: !prev[column]
    }));
  }, []);

  const sortData = useCallback((a: CommercialProductData, b: CommercialProductData) => {
    switch (sortBy) {
      case 'name':
        return a.ResourceName.localeCompare(b.ResourceName);
      case 'demand':
        return b.Demand - a.Demand;
      case 'workers':
        return b.Workers - a.Workers;
      case 'tax':
        return b.TaxFactor - a.TaxFactor;
      default:
        return 0;
    }
  }, [sortBy]);

  const filterData = useCallback((item: CommercialProductData) => {
    if (filterDemand === 'positive' && item.Demand <= 0) return false;
    if (filterDemand === 'negative' && item.Demand >= 0) return false;
    return true;
  }, [filterDemand]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <$Panel
      id="infoloom-commercial-products"
      title="Commercial Products"
      onClose={handleClose}
      initialSize={{ width: window.innerWidth * 0.45, height: window.innerHeight * 0.32 }}
      initialPosition={{ top: window.innerHeight * 0.05, left: window.innerWidth * 0.005 }}
    >
      {commercialProducts.length === 0 ? (
        <p>Waiting...</p>
      ) : (
        <div>
          <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Dropdown
              theme={DropdownStyle}
              content={
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Sort by Name"
                      isChecked={sortBy === 'name'}
                      onToggle={() => setSortBy('name')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Sort by Demand"
                      isChecked={sortBy === 'demand'}
                      onToggle={() => setSortBy('demand')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Sort by Workers"
                      isChecked={sortBy === 'workers'}
                      onToggle={() => setSortBy('workers')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Sort by Tax"
                      isChecked={sortBy === 'tax'}
                      onToggle={() => setSortBy('tax')}
                    />
                  </div>
                </div>
              }
            >
              <DropdownToggle style={{ marginRight: '5rem' }}>
                Sort Options
              </DropdownToggle>
            </Dropdown>

            <Dropdown
              theme={DropdownStyle}
              content={
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Show Demand"
                      isChecked={showColumns.demand}
                      onToggle={() => toggleColumn('demand')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Show Service"
                      isChecked={showColumns.service}
                      onToggle={() => toggleColumn('service')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Show Capacity"
                      isChecked={showColumns.capacity}
                      onToggle={() => toggleColumn('capacity')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Show Workers"
                      isChecked={showColumns.workers}
                      onToggle={() => toggleColumn('workers')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Show Tax"
                      isChecked={showColumns.tax}
                      onToggle={() => toggleColumn('tax')}
                    />
                  </div>
                </div>
              }
            >
              <DropdownToggle style={{ marginRight: '5rem' }}>
                Column Options
              </DropdownToggle>
            </Dropdown>

            <Dropdown
              theme={DropdownStyle}
              content={
                <div style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="All Demand"
                      isChecked={filterDemand === 'all'}
                      onToggle={() => setFilterDemand('all')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Positive Demand"
                      isChecked={filterDemand === 'positive'}
                      onToggle={() => setFilterDemand('positive')}
                    />
                  </div>
                  <div style={{ padding: '4px 8px', cursor: 'pointer' }}>
                    <InfoCheckbox
                      label="Negative Demand"
                      isChecked={filterDemand === 'negative'}
                      onToggle={() => setFilterDemand('negative')}
                    />
                  </div>
                </div>
              }
            >
              <DropdownToggle style={{ marginRight: '5rem' }}>
                Filter Options
              </DropdownToggle>
            </Dropdown>
          </div>

          <TableHeader showColumns={showColumns} />
          
          {commercialProducts
            .filter(item => item.ResourceName !== 'NoResource')
            .filter(filterData)
            .sort(sortData)
            .map(item => (
              <ResourceLine key={item.ResourceName} data={item} showColumns={showColumns} />
            ))}
        </div>
      )}
    </$Panel>
  );
  
  
};
 

export default $CommercialProducts;
