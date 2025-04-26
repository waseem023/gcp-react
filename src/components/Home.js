/*
Goal of React:
  1. React will retrieve GitHub created and closed issues for a given repository and will display the bar-charts 
     of same using high-charts        
  2. It will also display the images of the forecasted data for the given GitHub repository and images are being retrieved from 
     Google Cloud storage
  3. React will make a fetch api call to flask microservice.
*/

// Import required libraries
import * as React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import CssBaseline from "@mui/material/CssBaseline";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
// Import custom components
import BarCharts from "./BarCharts";
import Loader from "./Loader";
import { ListItemButton } from "@mui/material";

const drawerWidth = 240;
// List of GitHub repositories 
const repositories = [
  { key: "ollama/ollama",           value: "Ollama" },
  { key: "langchain-ai/langchain",  value: "LangChain" },
  { key: "langchain-ai/langgraph",  value: "LangGraph" },
  { key: "microsoft/autogen",       value: "AutoGen" },
  { key: "openai/openai-cookbook",  value: "OpenAI Cookbook" },
  { key: "meta-llama/llama3",       value: "Llama 3" },
  { key: "elastic/elasticsearch",   value: "Elasticsearch" },
  { key: "milvus-io/pymilvus",      value: "PyMilvus" },
];

export default function Home() {
  /*
  The useState is a react hook which is special function that takes the initial 
  state as an argument and returns an array of two entries. 
  */
  /*
  setLoading is a function that sets loading to true when we trigger flask microservice
  If loading is true, we render a loader else render the Bar charts
  */
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState("repository"); 
// can be "repository" or "stars"
  /* 
  setRepository is a function that will update the user's selected repository such as Angular,
  Angular-cli, Material Design, and D3
  The repository "key" will be sent to flask microservice in a request body
  */
  const [repository, setRepository] = useState({
    key: "ollama/ollama",           value: "Ollama" ,
  });
  /*
  
  The first element is the initial state (i.e. githubRepoData) and the second one is a function 
  (i.e. setGithubData) which is used for updating the state.

  so, setGitHub data is a function that takes the response from the flask microservice 
  and updates the value of gitHubrepo data.
  */
  const [githubRepoData, setGithubData] = useState([]);
  // Updates the repository to newly selected repository
  const eventHandler = (repo) => {
    setRepository(repo);
    setMode("repository");  // reset mode when clicking on a repo
  };

  /* 
  Fetch the data from flask microservice on Component load and on update of new repository.
  Everytime there is a change in a repository, useEffect will get triggered, useEffect inturn will trigger 
  the flask microservice 
  */
  React.useEffect(() => {
    // set loading to true to display loader
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Append the repository key to request body
      body: JSON.stringify({ repository: repository.key }),
    };

    /*
    Fetching the GitHub details from flask microservice
    The route "/api/github" is served by Flask/App.py in the line 53
    @app.route('/api/github', methods=['POST'])
    Which is routed by setupProxy.js to the
    microservice target: "your_flask_gcloud_url"
    */
    fetch("/api/github", requestOptions)
      .then((res) => res.json())
      .then(
        // On successful response from flask microservice
        (result) => {
          // On success set loading to false to display the contents of the resonse
          setLoading(false);
          // Set state on successfull response from the API
          setGithubData(result);
          console.log(result);
        },
        // On failure from flask microservice
        (error) => {
          // Set state on failure response from the API
          console.log(error);
          // On failure set loading to false to display the error message
          setLoading(false);
          setGithubData([]);
        }
      );
  }, [repository]);
  const [starsChartUrl, setStarsChartUrl] = useState("");
  const [forksChartUrl, setForksChartUrl] = useState("");

  const handleAnalyze = (type) => {
    setLoading(true);
  
    if (type === "stars") {
      setMode("stars");
      fetch("/api/stars")
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          setStarsChartUrl(data.star_bar_chart_url);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
    else if (type === "forks") {
      setMode("forks");
      fetch("/api/forks")
        .then((res) => res.json())
        .then((data) => {
          setLoading(false);
          setForksChartUrl(data.forks_bar_chart_url);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* Application Header */}
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Timeseries Forecasting
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
  variant="permanent"
  sx={{
    width: drawerWidth,
    flexShrink: 0,
    [`& .MuiDrawer-paper`]: {
      width: drawerWidth,
      boxSizing: "border-box",
    },
  }}
>
  <Toolbar />
  <Box sx={{ overflow: "auto" }}>
    <List>
      {/* Iterate through the repositories list */}
      {repositories.map((repo) => (
        <ListItem
          button
          key={repo.key}
          onClick={() => eventHandler(repo)}
          disabled={loading && repo.value !== repository.value}
        >
          <ListItemButton selected={repo.value === repository.value}>
            <ListItemText primary={repo.value} />
          </ListItemButton>
        </ListItem>
      ))}

      {/* Divider before static analysis buttons */}
      <Divider sx={{ my: 2 }} />

      {/* Static stars analysis button */}
      <ListItem
        button
        onClick={() => handleAnalyze("stars")}
        disabled={loading}
      >
        <ListItemButton>
          <ListItemText primary="Analyze Stars of all repositories" />
        </ListItemButton>
      </ListItem>

      {/* Static forks analysis button (future use) */}
      <ListItem
        button
        onClick={() => handleAnalyze("forks")}
        disabled={loading}
      >
        <ListItemButton>
          <ListItemText primary=" Analyze Forks of all repositories" />
        </ListItemButton>
      </ListItem>
    </List>
  </Box>
</Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {/* Render loader component if loading is true else render charts and images */}
        {loading ? (
  <Loader />
) : mode === "repository" ? (
  
<div>
{/* Render barchart component for a monthly created issues for a selected repositories*/}
<BarCharts
  title={`Monthly Created Issues for ${repository.value} in last 1 year`}
  data={githubRepoData?.created}
/>
{/* Render barchart component for a monthly created issues for a selected repositories*/}
<BarCharts
  title={`Monthly Closed Issues for ${repository.value} in last 1 year`}
  data={githubRepoData?.closed}
/>
<Divider
  sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
/>
{/* Rendering Timeseries Forecasting of Created Issues using Tensorflow and
    Keras LSTM */}
<div>
  <Typography variant="h5" component="div" gutterBottom>
    Timeseries Forecasting of Created Issues using Tensorflow and
    Keras LSTM based on past month
  </Typography>

  <div>
    <Typography component="h4">
      Model Loss for Created Issues
    </Typography>
    {/* Render the model loss image for created issues */}
    <img
      src={githubRepoData?.createdAtImageUrls?.model_loss_image_url}
      alt={"Model Loss for Created Issues"}
      loading={"lazy"}
    />
  </div>
  <div>
    <Typography component="h4">
      LSTM Generated Data for Created Issues
    </Typography>
    {/* Render the LSTM generated image for created issues*/}
    <img
      src={
        githubRepoData?.createdAtImageUrls?.lstm_generated_image_url
      }
      alt={"LSTM Generated Data for Created Issues"}
      loading={"lazy"}
    />
  </div>
  <div>
    <Typography component="h4">
      All Issues Data for Created Issues
    </Typography>
    {/* Render the all issues data image for created issues*/}
    <img
      src={
        githubRepoData?.createdAtImageUrls?.all_issues_data_image
      }
      alt={"All Issues Data for Created Issues"}
      loading={"lazy"}
    />
  </div>
</div>
{/* Rendering Timeseries Forecasting of Closed Issues using Tensorflow and
    Keras LSTM  */}
<div>
  <Divider
    sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500" }}
  />
  <Typography variant="h5" component="div" gutterBottom>
    Timeseries Forecasting of Closed Issues using Tensorflow and
    Keras LSTM based on past month
  </Typography>

  <div>
    <Typography component="h4">
      Model Loss for Closed Issues
    </Typography>
    {/* Render the model loss image for closed issues  */}
    <img
      src={githubRepoData?.closedAtImageUrls?.model_loss_image_url}
      alt={"Model Loss for Closed Issues"}
      loading={"lazy"}
    />
  </div>
  <div>
    <Typography component="h4">
      LSTM Generated Data for Closed Issues
    </Typography>
    {/* Render the LSTM generated image for closed issues */}
    <img
      src={
        githubRepoData?.closedAtImageUrls?.lstm_generated_image_url
      }
      alt={"LSTM Generated Data for Closed Issues"}
      loading={"lazy"}
    />
  </div>
  <div>
    <Typography component="h4">
      All Issues Data for Closed Issues
    </Typography>
    {/* Render the all issues data image for closed issues*/}
    <img
      src={githubRepoData?.closedAtImageUrls?.all_issues_data_image}
      alt={"All Issues Data for Closed Issues"}
      loading={"lazy"}
    />
  </div>
  <Divider sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500", marginY: 2 }} />



<div>
<Typography variant="h5" component="div" gutterBottom>
Timeseries Forecasting using Statsmodels SARIMAX
</Typography>

{/* Created Issues SARIMAX Forecast */}
<div>
<Typography component="h4">
SARIMAX Forecast for Created Issues
</Typography>
<img
src={githubRepoData?.createdAtImageUrls?.sarimax_forecast_image_url}
alt="SARIMAX Forecast for Created Issues"
loading="lazy"
style={{ width: "100%", marginTop: "10px" }}
/>
</div>

<Divider sx={{ borderBlockWidth: "2px", borderBlockColor: "#00BFFF", marginY: 2 }} />

{/* Closed Issues SARIMAX Forecast */}
<div>
<Typography component="h4">
SARIMAX Forecast for Closed Issues
</Typography>
<img
src={githubRepoData?.closedAtImageUrls?.sarimax_forecast_image_url}
alt="SARIMAX Forecast for Closed Issues"
loading="lazy"
style={{ width: "100%", marginTop: "10px" }}
/>
</div>
</div>
<Divider sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500", marginY: 2 }} />


<Divider sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500", marginY: 2 }} />

{githubRepoData?.pullsForecastImageUrls && (
  <div>
    <Typography variant="h5" component="div" gutterBottom>
      Timeseries Forecasting of Pull Requests
    </Typography>

    {/* Model Loss */}
    {githubRepoData?.pullsForecastImageUrls?.model_loss_image_url && (
      <div>
        <Typography component="h4">Model Loss for Pull Requests</Typography>
        <img
          src={githubRepoData.pullsForecastImageUrls.model_loss_image_url}
          alt="Model Loss for Pull Requests"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}

    {/* LSTM Forecast */}
    {githubRepoData?.pullsForecastImageUrls?.lstm_generated_image_url && (
      <div>
        <Typography component="h4">LSTM Forecast for Pull Requests</Typography>
        <img
          src={githubRepoData.pullsForecastImageUrls.lstm_generated_image_url}
          alt="LSTM Forecast for Pull Requests"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}

    {/* All Pull Requests Historical Data */}
    {githubRepoData?.pullsForecastImageUrls?.all_pulls_data_image && (
      <div>
        <Typography component="h4">All Pull Requests Historical Data</Typography>
        <img
          src={githubRepoData.pullsForecastImageUrls.all_pulls_data_image}
          alt="All Pulls Historical Data"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}

    <Divider sx={{ borderBlockWidth: "2px", borderBlockColor: "#00BFFF", marginY: 2 }} />

    {/* Prophet Forecast */}
    {githubRepoData?.pullsForecastImageUrls?.prophet_forecast_image_url && (
      <div>
        <Typography component="h4">Prophet Forecast for Pull Requests</Typography>
        <img
          src={githubRepoData.pullsForecastImageUrls.prophet_forecast_image_url}
          alt="Prophet Forecast for Pull Requests"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}

    <Divider sx={{ borderBlockWidth: "2px", borderBlockColor: "#00BFFF", marginY: 2 }} />

    {/* SARIMAX Forecast */}
    {githubRepoData?.pullsForecastImageUrls?.sarimax_forecast_image_url && (
      <div>
        <Typography component="h4">SARIMAX Forecast for Pull Requests</Typography>
        <img
          src={githubRepoData.pullsForecastImageUrls.sarimax_forecast_image_url}
          alt="SARIMAX Forecast for Pull Requests"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}
  </div>
)}

<Divider sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500", marginY: 2 }} />


{githubRepoData?.branchesForecastImageUrls && (
  <div>
    <Typography variant="h5" component="div" gutterBottom>
      Timeseries Forecasting of Branches
    </Typography>


    {/* All Branches Data */}
    {githubRepoData.branchesForecastImageUrls.all_branches_data_image && (
      <div>
        <Typography component="h4">All Branches Historical Data</Typography>
        <img
          src={githubRepoData.branchesForecastImageUrls.all_branches_data_image}
          alt="All Branches Historical Data"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}

    <Divider sx={{ borderBlockWidth: "2px", borderBlockColor: "#00BFFF", marginY: 2 }} />

    {/* Prophet Forecast */}
    {githubRepoData.branchesForecastImageUrls.prophet_forecast_image_url && (
      <div>
        <Typography component="h4">Prophet Forecast for Branches</Typography>
        <img
          src={githubRepoData.branchesForecastImageUrls.prophet_forecast_image_url}
          alt="Prophet Forecast for Branches"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}

    <Divider sx={{ borderBlockWidth: "2px", borderBlockColor: "#00BFFF", marginY: 2 }} />

    {/* SARIMAX Forecast */}
    {githubRepoData.branchesForecastImageUrls.sarimax_forecast_image_url && (
      <div>
        <Typography component="h4">SARIMAX Forecast for Branches</Typography>
        <img
          src={githubRepoData.branchesForecastImageUrls.sarimax_forecast_image_url}
          alt="SARIMAX Forecast for Branches"
          loading="lazy"
          style={{ width: "100%", marginTop: "10px" }}
        />
      </div>
    )}
  </div>
)}

<Divider sx={{ borderBlockWidth: "3px", borderBlockColor: "#FFA500", marginY: 2 }} />
</div>
</div>



) : mode === "stars" ? (
  <div>
    <Typography variant="h5" gutterBottom>
      Stars Comparison Across All Repositories
    </Typography>
    <img
      src={starsChartUrl}
      alt="Stars Chart"
      loading="lazy"
      style={{ width: "100%", maxWidth: "900px", marginTop: "10px" }}
    />
  </div>
) :
mode === "forks" ? (
  <div>
    
    <Typography variant="h5" gutterBottom>
      Forks Comparison Across All Repositories
    </Typography>
    <img
      src={forksChartUrl}
      alt="Forks Chart"
      loading="lazy"
      style={{ width: "100%", maxWidth: "900px", marginTop: "10px" }}
    />
  </div>
) :(
  <div>
    <Typography variant="h5">Github analytics forecasting</Typography>
  </div>
)}
      </Box>
    </Box>
  );
}
