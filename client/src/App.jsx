import { useState } from 'react';
import { Box, Typography, Container, Button } from '@mui/material';

function App() {
  const [count, setCount] = useState(0);

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          BuJoGeek
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Digital Bullet Journal
        </Typography>
        <Box sx={{ my: 4 }}>
          <Button
            variant="contained"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </Button>
        </Box>
        <Typography variant="body1">
          Coming soon - Part of GeekSuite
        </Typography>
      </Box>
    </Container>
  );
}

export default App;