import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { React, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis, YAxis,
} from 'recharts';

// graphing code adapted from https://codesandbox.io/s/recharts-area-chart-with-date-axis-6o55k
function CustomTooltip({ active, payload }) {
  if (active) {
    const currData = payload && payload.length ? payload[0].payload : null;
    const rankKey = Object.keys(currData).find((key) => key.includes('$rank$'));
    const listName = rankKey ? rankKey.split('$rank$')[1] : null;

    return (
      <div
        className="area-chart-tooltip"
        style={{ background: 'rgba(255, 255, 255, 0.8)', padding: '0.5rem 1rem', border: '1px solid #ccc' }}
      >
        <p>
          {currData ? new Date(currData.bestsellers_date).toLocaleDateString() : '--'}
        </p>
        <p>
          {`Ranking on ${listName} Bestseller List: `}
          <b>{currData ? currData[rankKey] : ' -- '}</b>
        </p>
      </div>
    );
  }

  return null;
}

function NYTGraph({ rankingData }) {
  const results = rankingData.map((result) => (
    {
      bestsellers_date: new Date(result.bestsellers_date).getTime(),
      [`$rank$${result.list_name}`]: result.rank,
    }
  )).sort((a, b) => a.bestsellers_date - b.bestsellers_date);

  const startDateTimestamp = Math.min(results.map((result) => result.bestsellers_date));
  const endDateTimestamp = Math.max(results.map((result) => result.bestsellers_date));

  const rankingKeys = results.reduce((acc, result) => {
    const rankKey = Object.keys(result).find((key) => key.includes('$rank$'));
    if (!acc.includes(rankKey)) {
      return acc.concat([rankKey]);
    }
    return acc;
  }, []);

  const rankTicks = rankingData.map((result) => result.rank)
    .filter((rank, i, arr) => arr.indexOf(rank) === i)
    .sort((a, b) => a - b);
  const colours = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', 'red', 'pink'];

  return (
    <ResponsiveContainer>
      <LineChart
        data={results}
      >
        <CartesianGrid stroke="#ccc" strokeDasharray="3 3" />
        <XAxis
          dataKey="bestsellers_date"
          tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
          domain={[startDateTimestamp, endDateTimestamp]}
          label={{ value: 'Date', offset: 0, position: 'bottom' }}
          padding="gap"
        />
        <YAxis
          reversed
          domain={[1, 'dataMax']}
          label={{ value: 'Ranking', angle: -90, position: 'insideLeft' }}
          ticks={[0, 1, ...rankTicks]}
          tickCount={rankTicks.length}
        />
        {rankingKeys.map((key, i) => (
          <Line key={key} type="monotone" dataKey={key} connectNulls stroke={colours[i % colours.length]} />
        ))}
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(name) => name.split('$rank$')[1]} wrapperStyle={{ bottom: -20 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function NYTHistoryDialogButton({ rankingData }) {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <Dialog
        onClose={handleClose}
        open={open}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            maxHeight: '100%', height: '70%', padding: '2rem 2rem',
          },
        }}
      >
        <DialogTitle align="center" sx={{ marginTop: '2%' }}>New York Times Bestseller&apos;s History</DialogTitle>
        <NYTGraph rankingData={rankingData} />
      </Dialog>
      <Typography>
        <Button variant="outlined" sx={{ width: 'fit-content' }} onClick={handleToggle}>View History</Button>
      </Typography>
    </>
  );
}

export default NYTHistoryDialogButton;
