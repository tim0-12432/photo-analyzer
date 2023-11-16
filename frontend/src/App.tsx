import { useState, useEffect, FormEvent } from 'react'
import { TreeView } from '@mui/x-tree-view/TreeView';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { Box, Typography, CircularProgress, Button, TextField, FormGroup, FormControlLabel, Checkbox, Tooltip, Card, CardContent } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import StyledTreeItem from './components/TreeItem';
import type File from './types/File';
import Image from './types/Image';
import Section from './components/Section';
import ChartCard from './components/ChartCard';
import capitalize, { getFraction } from './utils/formatting';


const apiHost = import.meta.env.DEV ? 'http://localhost:5050' : '';

function App() {
  const [currentDir, setCurrentDir] = useState<string>('C:\\Users');
  const [currentDirContent, setCurrentDirContent] = useState<File[]>([]);
  const [currentAnalysis, setCurrentAnalysis] = useState<Image[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState<boolean>(false);
  const [showUnknown, setShowUnknown] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(apiHost + '/api/directory');
      const data = await result.json();
      setCurrentDir(() => data);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const resultFiles = await fetch(apiHost + '/api/directory/files');
      const dataFiles = await resultFiles.json();
      setCurrentDirContent(() => dataFiles);
      setLoadingAnalysis(() => true);
      const resultImages = await fetch(apiHost + '/api/directory/images');
      const dataImages = await resultImages.json();
      setCurrentAnalysis(() => dataImages);
      setLoadingAnalysis(() => false);
    };
    fetchData();
  }, [currentDir]);

  const handleNodeSelect = (name: string) => {
    const fetchData = async () => {
      const result = await fetch(apiHost + '/api/directory?path=' + name, {
        method: 'POST'
      });
      const data = await result.json();
      setCurrentDir(() => data);
    };
    fetchData();
  };

  const handleChangePathSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    handleNodeSelect(e.target[0].value);
  };

  const camModels = [...new Set(currentAnalysis
    .map((image: Image) => image.exif.model === null ? 'Unknown' : image.exif.model)
    .filter((model: string) => model !== 'Unknown' || showUnknown)
  )];
  console.log(currentDir, currentDirContent, currentAnalysis, camModels);
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      height: '100vh',
      padding: 0,
      width: '100vw'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        overflowX: 'show',
        overflowY: 'auto',
        padding: (theme) => theme.spacing(4),
        borderRight: (theme) => `1px solid ${theme.palette.divider}`
      }}>
        <Box
          component="form"
          onSubmit={(e: FormEvent<HTMLFormElement>) => handleChangePathSubmit(e)}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: (theme) => theme.spacing(2.5)
          }}
        >
          <TextField
            variant="outlined"
            label="Change directory"
            defaultValue={currentDir}
            sx={{
              flexGrow: 1,
              minWidth: (theme) => theme.spacing(30)
            }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={{
              marginLeft: (theme) => theme.spacing(2)
            }}
          >
            Change
          </Button>
        </Box>
        <TreeView
          defaultCollapseIcon={<ArrowDropDownIcon />}
          defaultExpandIcon={<ArrowRightIcon />}
          defaultExpanded={['1']}
        >
          <StyledTreeItem
            nodeId="1"
            labelText={currentDir}
            labelIcon={FolderIcon}
          >
          {
            currentDirContent.map((file: File, index) => {
              const idx = index + 2;
              if (file.isFile) {
                return (
                  <Tooltip
                    key={idx}
                    title={<Card variant="outlined">
                      <CardContent>
                        {
                          currentAnalysis.filter((image: Image) => image.name === file.name).length > 0 ? (
                            <>
                              <Typography
                                variant="h5"
                                component="p"
                                sx={{
                                  marginBottom: (theme) => theme.spacing(1.5),
                                }}
                              >
                                {file.name}
                              </Typography>
                              {
                                Object.entries(currentAnalysis.filter((image: Image) => image.name === file.name).map((image: Image) => image.exif)[0]).map(([key, value]) => (
                                  <Typography key={key} variant="body2" component="p">
                                    <b>{capitalize(key)}</b>: {value}
                                  </Typography>
                                ))
                              }
                            </>
                          ) : (
                            <Typography variant="body2" component="p">
                              {file.name}
                            </Typography>
                          )
                        }
                      </CardContent>
                    </Card>}
                    followCursor
                  >
                    <StyledTreeItem
                      nodeId={idx.toString()}
                      labelText={file.name}
                      labelIcon={InsertDriveFileIcon}
                    />
                  </Tooltip>
                )
              }
              return (
                <StyledTreeItem
                  key={idx}
                  nodeId={idx.toString()}
                  labelText={file.name}
                  labelIcon={FolderIcon}
                  onClick={() => handleNodeSelect(file.name)}
                />
              )
            })
          }
          </StyledTreeItem>
        </TreeView>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: (theme) => theme.spacing(4),
        flexGrow: 1
      }}>
        {
          currentAnalysis.length <= 0 || loadingAnalysis ? (
            <CircularProgress />
          ) : (
            <>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  marginBottom: (theme) => theme.spacing(1.5),
                  paddingX: (theme) => theme.spacing(4),
                  paddingBottom: (theme) => theme.spacing(1.5),
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography
                  variant="h5"
                  color="text.secondary"
                >
                  Settings
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showUnknown}
                        onChange={() => setShowUnknown((prev) => !prev)}
                      />
                    }
                    label="Show Unknown"
                  />
                </FormGroup>
              </Box>
              <Section title="Camera and Lens">
                <ChartCard>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(currentAnalysis.reduce((prev: {[key: string]: number}, curr: Image) => {
                          const camera = curr.exif.manufacturer === null || curr.exif.model === null
                            ? "Unknown" : curr.exif.manufacturer + ' ' + curr.exif.model;
                          if (camera === 'Unknown' && !showUnknown) {
                            return prev;
                          }
                          if (!prev.hasOwnProperty(camera)) {
                            prev[camera] = 1;
                          } else {
                            prev[camera] += 1;
                          }
                          return prev;
                        }, {})).map(([key, value], idx) => ({
                          id: idx,
                          label: key,
                          value: value
                        }))
                      },
                    ]}
                    width={400}
                    height={200}
                  />
                </ChartCard>
                <ChartCard>
                  <BarChart
                    series={
                      Object.entries(currentAnalysis.reduce((prev: {[lens: string]: {[cam: string]: number}}, curr: Image) => {
                        const lens = curr.exif.lens === 'None None' ? 'Unknown' : curr.exif.lens;
                        const model = curr.exif.model ?? 'Unknown';
                        if ((lens === 'Unknown' || model === 'Unknown') && !showUnknown) {
                          return prev;
                        }
                        if (!prev.hasOwnProperty(lens) || !prev[lens].hasOwnProperty(model)) {
                          prev[lens] = prev[lens] || {};
                          prev[lens][model] = 1;
                        } else {
                          prev[lens][model] += 1;
                        }
                        return prev;
                      }, {})).map(([lens, value]): {data: number[], label: string} => ({
                        data: camModels.map((cam) => value.hasOwnProperty(cam) ? value[cam] : 0),
                        label: lens
                      }))
                    }
                    width={400}
                    height={350}
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: camModels
                      },
                    ]}
                  />
                </ChartCard>
              </Section>
              <Section title="Focal Length">
                <ChartCard>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(currentAnalysis.reduce((prev: {[key: string]: number}, curr: Image) => {
                          const focalLength = curr.exif.focal_length === null || curr.exif.focal_length === undefined
                            ? "Unknown" : curr.exif.focal_length.toString();
                          if (focalLength === 'Unknown' && !showUnknown) {
                            return prev;
                          }
                          if (!(focalLength in prev)) {
                            prev[focalLength] = 1;
                          } else {
                            prev[focalLength] += 1;
                          }
                          return prev;
                        }, {})).map(([key, value], idx) => ({
                          id: idx,
                          label: key,
                          value: value
                        }))
                      },
                    ]}
                    width={400}
                    height={200}
                  />
                </ChartCard>
                <ChartCard>
                  <BarChart
                    series={
                      Object.entries(currentAnalysis.reduce((prev: {[focalLength: string]: {[cam: string]: number}}, curr: Image) => {
                        const focalLength = curr.exif.focal_length === null || curr.exif.focal_length === undefined
                        ? 'Unknown' : curr.exif.focal_length.toString();
                        const model = curr.exif.model ?? 'Unknown';
                        if ((focalLength === 'Unknown' || model === 'Unknown') && !showUnknown) {
                          return prev;
                        }
                        if (!(focalLength in prev) || !(model in prev[focalLength])) {
                          prev[focalLength] = prev[focalLength] || {};
                          prev[focalLength][model] = 1;
                        } else {
                          prev[focalLength][model] += 1;
                        }
                        return prev;
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }, {})).sort(([fA, _], [fB, __]) => {
                        const fAL: number = fA === 'Unknown' ? 0 : parseFloat(fA);
                        const fBL: number = fB === 'Unknown' ? 0 : parseFloat(fB);
                        return fAL - fBL;
                      }).map(([focalLength, value]): {data: number[], label: string} => ({
                        data: camModels.map((cam) => cam in value ? value[cam] : 0),
                        label: focalLength
                      }))
                    }
                    width={400}
                    height={350}
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: camModels
                      },
                    ]}
                  />
                </ChartCard>
              </Section>
              <Section title="Aperture">
                <ChartCard>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(currentAnalysis.reduce((prev: {[key: string]: number}, curr: Image) => {
                          const aperture = curr.exif.aperture === null || curr.exif.aperture === undefined
                            ? "Unknown" : curr.exif.aperture.toString();
                          if (aperture === 'Unknown' && !showUnknown) {
                            return prev;
                          }
                          if (!(aperture in prev)) {
                            prev[aperture] = 1;
                          } else {
                            prev[aperture] += 1;
                          }
                          return prev;
                        }, {})).map(([key, value], idx) => ({
                          id: idx,
                          label: key,
                          value: value
                        }))
                      },
                    ]}
                    width={400}
                    height={200}
                  />
                </ChartCard>
                <ChartCard>
                  <BarChart
                    series={
                      Object.entries(currentAnalysis.reduce((prev: {[focalLength: string]: {[cam: string]: number}}, curr: Image) => {
                        const aperture = curr.exif.aperture === null || curr.exif.aperture === undefined
                        ? 'Unknown' : curr.exif.aperture.toString();
                        const model = curr.exif.model ?? 'Unknown';
                        if ((aperture === 'Unknown' || model === 'Unknown') && !showUnknown) {
                          return prev;
                        }
                        if (!(aperture in prev) || !(model in prev[aperture])) {
                          prev[aperture] = prev[aperture] || {};
                          prev[aperture][model] = 1;
                        } else {
                          prev[aperture][model] += 1;
                        }
                        return prev;
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }, {})).sort(([aA, _], [aB, __]) => {
                        const fAL: number = aA === 'Unknown' ? 0 : parseFloat(aA);
                        const fBL: number = aB === 'Unknown' ? 0 : parseFloat(aB);
                        return fAL - fBL;
                      }).map(([aperture, value]): {data: number[], label: string} => ({
                        data: camModels.map((cam) => cam in value ? value[cam] : 0),
                        label: aperture
                      }))
                    }
                    width={400}
                    height={350}
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: camModels
                      },
                    ]}
                  />
                </ChartCard>
              </Section>
              <Section title="ISO">
                <ChartCard>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(currentAnalysis.reduce((prev: {[key: string]: number}, curr: Image) => {
                          const iso = curr.exif.iso === null || curr.exif.iso === undefined
                            ? "Unknown" : curr.exif.iso.toString();
                          if (iso === 'Unknown' && !showUnknown) {
                            return prev;
                          }
                          if (!(iso in prev)) {
                            prev[iso] = 1;
                          } else {
                            prev[iso] += 1;
                          }
                          return prev;
                        }, {})).map(([key, value], idx) => ({
                          id: idx,
                          label: key,
                          value: value
                        }))
                      },
                    ]}
                    width={400}
                    height={200}
                  />
                </ChartCard>
                <ChartCard>
                  <BarChart
                    series={
                      Object.entries(currentAnalysis.reduce((prev: {[focalLength: string]: {[cam: string]: number}}, curr: Image) => {
                        const iso = curr.exif.iso === null || curr.exif.iso === undefined
                        ? 'Unknown' : curr.exif.iso.toString();
                        const model = curr.exif.model ?? 'Unknown';
                        if ((iso === 'Unknown' || model === 'Unknown') && !showUnknown) {
                          return prev;
                        }
                        if (!(iso in prev) || !(model in prev[iso])) {
                          prev[iso] = prev[iso] || {};
                          prev[iso][model] = 1;
                        } else {
                          prev[iso][model] += 1;
                        }
                        return prev;
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }, {})).sort(([iA, _], [iB, __]) => {
                        const fAL: number = iA === 'Unknown' ? 0 : parseFloat(iA);
                        const fBL: number = iB === 'Unknown' ? 0 : parseFloat(iB);
                        return fAL - fBL;
                      }).map(([iso, value]): {data: number[], label: string} => ({
                        data: camModels.map((cam) => cam in value ? value[cam] : 0),
                        label: iso
                      }))
                    }
                    width={400}
                    height={350}
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: camModels
                      },
                    ]}
                  />
                </ChartCard>
              </Section>
              <Section title="Exposure">
                <ChartCard>
                  <PieChart
                    series={[
                      {
                        data: Object.entries(currentAnalysis.reduce((prev: {[key: string]: number}, curr: Image) => {
                          const exposure = curr.exif.exposure === null || curr.exif.exposure === undefined
                            ? "Unknown" : getFraction(curr.exif.exposure);
                          if (exposure === 'Unknown' && !showUnknown) {
                            return prev;
                          }
                          if (!(exposure in prev)) {
                            prev[exposure] = 1;
                          } else {
                            prev[exposure] += 1;
                          }
                          return prev;
                        }, {})).map(([key, value], idx) => ({
                          id: idx,
                          label: key,
                          value: value
                        }))
                      },
                    ]}
                    width={400}
                    height={200}
                  />
                </ChartCard>
                <ChartCard>
                  <BarChart
                    series={
                      Object.entries(currentAnalysis.reduce((prev: {[focalLength: string]: {[cam: string]: number}}, curr: Image) => {
                        const exposure = curr.exif.exposure === null || curr.exif.exposure === undefined
                        ? 'Unknown' : getFraction(curr.exif.exposure);
                        const model = curr.exif.model ?? 'Unknown';
                        if ((exposure === 'Unknown' || model === 'Unknown') && !showUnknown) {
                          return prev;
                        }
                        if (!(exposure in prev) || !(model in prev[exposure])) {
                          prev[exposure] = prev[exposure] || {};
                          prev[exposure][model] = 1;
                        } else {
                          prev[exposure][model] += 1;
                        }
                        return prev;
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      }, {})).sort(([eA, _], [eB, __]) => {
                        const fAL: number = eA === 'Unknown' ? 0 : parseFloat(eA);
                        const fBL: number = eB === 'Unknown' ? 0 : parseFloat(eB);
                        return fAL - fBL;
                      }).map(([exposure, value]): {data: number[], label: string} => ({
                        data: camModels.map((cam) => cam in value ? value[cam] : 0),
                        label: exposure
                      }))
                    }
                    width={400}
                    height={350}
                    xAxis={[
                      {
                        scaleType: 'band',
                        data: camModels
                      },
                    ]}
                  />
                </ChartCard>
              </Section>
            </>
          )
        }
      </Box>
    </Box>
  )
}

export default App