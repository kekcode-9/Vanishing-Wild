"use client";
import React, { useMemo } from "react";
import styled from "styled-components";
import dynamic from "next/dynamic";
import Highcharts from "highcharts";

const HighchartsReact = dynamic(
  () => import("highcharts-react-official").then((h) => h.HighchartsReact),
  { ssr: false }
);

const ChartWrapper = styled.div`
  width: 100%;
  height: 100%;
  font-size: 20px;
`;

export default function AreaChart({ data, title, xAxisLabel, yAxisLabel }) {
  const options = useMemo(
    () => ({
      series: data,
      chart: {
        type: "area",
        spacingLeft: 0,
        height: (8 / 16) * 100 + "%", // 16:9 ratio
        zoomType: "xy",
        pinchType: "xy",
        panning: {
          enabled: true,
          type: "xy",
        },
        // panKey:
        backgroundColor: "transparent",
        animation: true,
      },
      title: {
        text: title,
        style: {
          align: "left",
          color: " #ffffff",
        },
      },
      xAxis: {
        tickColor: " #ffffff",
        title: {
          text: xAxisLabel,
          offset: 60,
          style: {
            color: " #ffffff",
          },
        },
        lineColor: " #ffffff",
        allowDecimals: false,
        type: "linear",
        labels: {
          style: {
            color: " #ffffff",
          },
        },
        zoomEnabled: true,
      },
      yAxis: {
        tickColor: " #ffffff",
        lineColor: " #ffffff",
        lineWidth: 1,
        tickWidth: 1,
        title: {
          text: yAxisLabel,
          offset: 60,
          style: {
            color: " #ffffff",
          },
        },
        labels: {
          style: {
            color: " #ffffff",
          },
        },
      },
      tooltip: {
        shared: true,
        valueSuffix: " individuals",
      },
      legend: {
        enabled: true,
        itemStyle: {
          color: " #ffffff",
        },
      },
      credits: {
        enabled: false,
      },
      plotOptions: {
        area: {
          fillOpacity: 0.3,
          marker: {
            enabled: true,
          },
        },
      },
    }),
    [title, xAxisLabel, yAxisLabel, data]
  );

  return (
    <ChartWrapper className="chart-wrapper">
      <HighchartsReact highcharts={Highcharts} options={options} />
    </ChartWrapper>
  );
}
