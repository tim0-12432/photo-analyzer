import React from 'react'
import { Card, CardContent } from '@mui/material';


type ChartCardProps = {
    children?: React.ReactNode;
};


const ChartCard = (props: ChartCardProps) => {
  return (
    <Card
        sx={{
        marginBottom: (theme) => theme.spacing(2),
        }}
    >
        <CardContent>
            {props.children}
        </CardContent>
    </Card>
  );
};

export default ChartCard;