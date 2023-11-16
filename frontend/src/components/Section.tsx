import React from 'react'
import { Box, Typography } from '@mui/material';


type SectionProps = {
    children?: React.ReactNode;
    title: string;
};


export const Section = (props: SectionProps) => {
  return (
    <Box
        component="section"
        sx={{
            marginBottom: (theme) => theme.spacing(4),
            padding: (theme) => theme.spacing(2),
        }}
    >
        <Typography
            variant="h4"
            sx={{
            marginBottom: (theme) => theme.spacing(2),
            }}
        >
            {props.title}
        </Typography>
        {props.children}
    </Box>
  );
};

export default Section;