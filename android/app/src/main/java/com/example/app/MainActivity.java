package com.example.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // 启用WebView调试
    WebView.setWebContentsDebuggingEnabled(true);
    
    // 获取WebView实例并配置
    WebView webView = getBridge().getWebView();
    WebSettings settings = webView.getSettings();
    
    // 允许混合内容
    settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    
    // 启用JavaScript和DOM存储
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    
    // 设置UserAgent，某些服务器可能需要
    String userAgent = settings.getUserAgentString();
    settings.setUserAgentString(userAgent + " ScooterRentApp");
  }
}
