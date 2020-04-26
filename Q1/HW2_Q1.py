import pandas as pd
df = pd.read_csv('sales.csv', parse_dates=['Order Date'])
years = [2015, 2016]
df['Year'] = df['Order Date'].dt.year
df = df.loc[df['Year'].isin(years), :].sort_values(by=['Region', 'Year', 'Item Type']).reset_index(drop=True)
df.to_csv('table0.csv', index=False)

q12 = df.groupby(['Region', 'Year'])['Units Sold', 'Total Profit'].sum().reset_index()\
	.rename(columns={'Units Sold': 'Total Units Sold'})
q12['Total Profit'] = round(q12['Total Profit'], 2)
q12.to_csv('table1.csv', index=False)

q34_max = df.groupby(['Region', 'Year'])['Units Sold'].max().to_frame()
q34 = q34_max.join(df.set_index(['Region', 'Year', 'Units Sold']), how='left', on=['Region', 'Year', 'Units Sold'])\
	.rename(columns={'Total Profit': 'Item Profit', 'Item Type': 'Highest Sales Item'}).reset_index()
q34.to_csv('table2.csv', index=False)

q5 = q12.join(q34.set_index(['Region', 'Year']), on=['Region', 'Year'])\
	# .rename(columns={'Region.x': 'Region', 'Year.y': 'Year'})
q5['% Profit from Highest Sales Item'] = q5['Item Profit'] / q5['Total Profit']
q5 = q5.loc[:, q12.columns.tolist() + ['Highest Sales Item', '% Profit from Highest Sales Item']]
q5.to_csv('table.csv', index=False)