import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Container from '@mui/material/Container';
import Grid2 from '@mui/material/Grid2';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Yummydirt from '../assets/yummydirt.png';
import YummyLogo from '../assets/yummylogo.png';
import YummyMe from '../assets/yummyme.png';
import MeLogo from '../assets/MeLogo.ico';
import Lobster from '../assets/lobster.png';
import LobsterTeck from '../assets/lobsterteck.png';

const items = [
  {
    icon: <img src={YummyLogo}/>,
    title: 'yummydirt.com (2016-2018)',
    link: 'https://web.archive.org/web/20161106100941/http://www.yummydirt.com/',
    description:
      'My first personal website, created in 2016. I was 10 years old at the beginning of this project, and I created it using a text editor, HTML, CSS, and very basic JavaScript. It was a fun project, and I learned a lot from it.',
    imageLight: ('url(' + Yummydirt + ')'),
  },
  {
    icon: <img src={MeLogo} />,
    title: 'yummydirt.me (2022-2023)',
    link: 'https://yummydirtx.github.io/',
    description:
      'This website was designed in raw HTML, CSS, and Javascript based on real Web 1.0 websites, with vintage graphics. It includes a bottom bar with a (slightly outdated) population counter, an engaging choose your own adventure game, and a beautiful art gallery.',
    imageLight: ('url(' + YummyMe + ')'),
  },
  {
    icon: <img src={Lobster} />,
    title: 'LobsterTeck.tech (2022-forever)',
    link: 'https://yummydirtx.github.io/lobsterteck/',
    description:
      'As a C suite executive at LobsterTeck, we patented and released world peace*. This website was created to showcase our flagship product, but we never actually got around to making a product. The website is still up, though!',
    imageLight: 'url(' + LobsterTeck + ')',
  },
];

export default function PastWebsites() {
  const [selectedItemIndex, setSelectedItemIndex] = React.useState(0);

  const handleItemClick = (index) => {
    setSelectedItemIndex(index);
  };

  const selectedFeature = items[selectedItemIndex];

  return (
    <Container id="websites" sx={{ py: { xs: 2, sm: 4 } }}>
      <Grid2 container spacing={6}>
        <Grid2 item xs={12} md={6}>
          <div>
            <Typography component="h2" variant="h4" color="text.primary">
              Past Websites
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: { xs: 2, sm: 4 } }}
            >
              Here is a collection of my past personal websites, of varying levels of quality and completion.
            </Typography>
          </div>
          <Grid2 container item gap={1} sx={{ display: { xs: 'auto', sm: 'none' } }}>
            {items.map(({ title }, index) => (
              <Chip
                key={index}
                label={title}
                onClick={() => handleItemClick(index)}
                sx={{
                  borderColor: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index ? 'primary.light' : '';
                    }
                    return selectedItemIndex === index ? 'primary.light' : '';
                  },
                  background: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index ? 'none' : '';
                    }
                    return selectedItemIndex === index ? 'none' : '';
                  },
                  backgroundColor: selectedItemIndex === index ? 'primary.main' : '',
                  '& .MuiChip-label': {
                    color: selectedItemIndex === index ? '#fff' : '',
                  },
                }}
              />
            ))}
          </Grid2>
          <Box
            component={Card}
            variant="outlined"
            sx={{
              display: { xs: 'auto', sm: 'none' },
              mt: 4,
            }}
          >
            <Box
              sx={{
                backgroundImage: items[selectedItemIndex].imageLight,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                minHeight: 280,
              }}
            />
            <Box sx={{ px: 2, py: 2 }}>
              <Typography color="text.primary" variant="body2" fontWeight="bold">
                {selectedFeature.title}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ my: 0.5 }}>
                {selectedFeature.description}
              </Typography>
              <Link
                color="primary"
                variant="body2"
                fontWeight="bold"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  '& > svg': { transition: '0.2s' },
                  '&:hover > svg': { transform: 'translateX(2px)' },
                }}
                onClick={(event) => {
                  window.open(selectedFeature.link,'_blank');
                  event.stopPropagation();
                }}
              >
                <span>Visit archive</span>
                <ChevronRightRoundedIcon
                  fontSize="small"
                  sx={{ mt: '1px', ml: '2px' }}
                />
              </Link>
            </Box>
          </Box>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="flex-start"
            spacing={2}
            useFlexGap
            sx={{ width: '100%', display: { xs: 'none', sm: 'flex' } }}
          >
            {items.map(({ icon, title, description, link }, index) => (
              <Card
                key={index}
                variant="outlined"
                component={Button}
                onClick={() => handleItemClick(index)}
                sx={{
                  p: 3,
                  height: 'fit-content',
                  width: '100%',
                  background: 'none',
                  backgroundColor:
                    selectedItemIndex === index ? 'action.selected' : undefined,
                  borderColor: (theme) => {
                    if (theme.palette.mode === 'light') {
                      return selectedItemIndex === index
                        ? 'primary.light'
                        : 'grey.200';
                    }
                    return selectedItemIndex === index ? 'primary.dark' : 'grey.800';
                  },
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    textAlign: 'left',
                    flexDirection: { xs: 'column', md: 'row' },
                    alignItems: { md: 'center' },
                    gap: 2.5,
                  }}
                >
                  <Box
                    sx={{
                      color: (theme) => {
                        if (theme.palette.mode === 'light') {
                          return selectedItemIndex === index
                            ? 'primary.main'
                            : 'grey.300';
                        }
                        return selectedItemIndex === index
                          ? 'primary.main'
                          : 'grey.700';
                      },
                      height: '48px',
                      width: '48px',
                    }}
                  >
                    {icon}
                  </Box>
                  <Box sx={{ textTransform: 'none' }}>
                    <Typography
                      color="text.primary"
                      variant="body2"
                      fontWeight="bold"
                    >
                      {title}
                    </Typography>
                    <Typography
                      color="text.secondary"
                      variant="body2"
                      sx={{ my: 0.5 }}
                    >
                      {description}
                    </Typography>
                    <Link
                      color="primary"
                      variant="body2"
                      fontWeight="bold"
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        '& > svg': { transition: '0.2s' },
                        '&:hover > svg': { transform: 'translateX(2px)' },
                      }}
                      onClick={(event) => {
                        window.open(link,'_blank');
                        event.stopPropagation();
                      }}
                    >
                      <span>Visit archive</span>
                      <ChevronRightRoundedIcon
                        fontSize="small"
                        sx={{ mt: '1px', ml: '2px' }}
                      />
                    </Link>
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Grid2>
        <Grid2
          item
          xs={12}
          md={6}
          sx={{ display: { xs: 'none', sm: 'flex' }, width: '100%' }}
        >
          <Card
            variant="outlined"
            sx={{
              height: '100%',
              width: '100%',
              display: { xs: 'none', sm: 'flex' },
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                m: 'auto',
                width: '100%',
                height: 500,
                backgroundSize: 'cover',
                backgroundImage: items[selectedItemIndex].imageLight,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
              }}
            />
          </Card>
        </Grid2>
      </Grid2>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 4 }}>*We did not actually patent nor release world peace.</Typography>
    </Container>
  );
}