import { Station } from "../types";
import { type FunctionComponent } from "react";

// MUI Components
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import CardMedia from "@mui/material/CardMedia";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Rating from "@mui/material/Rating";
import Tooltip from "@mui/material/Tooltip";

// Icons
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import WarningIcon from "@mui/icons-material/Warning";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export interface StationCardProps {
    isFavorite: boolean;
    onFavoriteToggle: (stationName: string) => void;
    station: Station;
}

const StationCard: FunctionComponent<StationCardProps> = ({ station, isFavorite, onFavoriteToggle }) => {
    return <Card sx={{ width: 276 }}>
        <CardHeader
            sx={{
                "& .MuiCardHeader-title": {
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    width: 172,
                }
            }}
            avatar={<Tooltip title={station.DispatchedBy.length ? "Occupied" : "Free"}>{station.DispatchedBy.length ? <PersonIcon color="error" /> : <PersonOffIcon color="success" />}</Tooltip>}
            title={<Tooltip title={station.Name.length > 20 ? station.Name : null} disableInteractive><span>{station.Name}</span></Tooltip>}
            subheader={station.Prefix}
            action={
                <IconButton onClick={() => onFavoriteToggle(station.Name)} color={isFavorite ? "info" : "default"}>
                    {isFavorite ? <StarIcon /> : <StarBorderIcon />}
                </IconButton>} />
        <CardMedia component="img" image={station.MainImageURL} />
        <CardContent>
            <Grid container spacing={1} justifyContent="center" alignItems="center">
                <Grid item>
                    <Rating value={station.DifficultyLevel} emptyIcon={<WarningAmberIcon />} icon={<WarningIcon />} readOnly></Rating>
                </Grid>
                <Grid item xs={10}>
                    <Alert severity={station.DispatchedBy.length ? "error" : "success"}>{station.DispatchedBy.length ? "Occupied" : "Free"}</Alert>
                </Grid>
                <Grid item xs={2}>
                    <Tooltip title="Open location in Google Maps">
                        <IconButton href={`https://maps.google.com/?q=${station.Latititude},${station.Longitude}`} target="_blank">
                            <LocationOnIcon />
                        </IconButton>
                    </Tooltip>
                </Grid>
            </Grid>
        </CardContent>
    </Card>;
};

export default StationCard;
