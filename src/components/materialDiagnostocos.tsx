import { Button, Box, Paper } from '@mui/material';
import { useState } from 'react';
import { Multimetro } from '../instrumentos/multimetroo';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';


export default function MaterialDiagnostocos() {

    const [carouselIndex, setCarouselIndex] = useState(0);
    const carouselSlides = [
        <Multimetro key={0} />,
        <h1 key={1}>Slide 2</h1>,
        <h1 key={2}>Slide 3</h1>,
    ];

    const handlePrev = () => {
        setCarouselIndex((prev) => (prev === 0 ? carouselSlides.length - 1 : prev - 1));
    };
    const handleNext = () => {
        setCarouselIndex((prev) => (prev === carouselSlides.length - 1 ? 0 : prev + 1));
    };
    return (
        <div>
            <Box sx={{ width: '100%', minHeight: 420 }}>
                <Paper elevation={0}>
                    {carouselSlides[carouselIndex]}
                </Paper>
                <div className="position-relative relative" style={{ height: '50px', marginTop: '10px' }}>
                <Button
                    variant="contained"
                    onClick={handlePrev}
                    sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                    <ArrowBackIosIcon />
                </Button>
                <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                >
                    <ArrowForwardIosIcon />
                </Button>
                </div>
            </Box>
        </div>
    );
}