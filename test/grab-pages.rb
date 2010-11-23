require 'open-uri'
require 'rexml/document'
require 'fileutils'

module Program
  class << self
    def fetch_feed(url)
      content = nil
      open(url) do |f|
        content = f.read
      end
      content
    end
    
    def fetch_digg_feed
      url = 'http://services.digg.com/2.0/story.getTopNews?type=rss'
      content = fetch_feed(url)
      content.force_encoding('iso-8859-1');
      content.encode('utf-8')
    end
    
    def fetch_hackernews_feed
      url = 'http://news.ycombinator.com/rss'
      fetch_feed(url)
    end
    
    def fetch_delicious_feed
      url = 'http://feeds.delicious.com/v2/rss/?count=30'
      fetch_feed(url)
    end
    
    def parse_rss(feed)
      xml = REXML::Document.new(feed)
      xml.elements.each("//item") do |item|
        link = item.get_elements('link')[0].text.strip
        title = item.get_elements('title')[0].text.strip
        yield link, title
      end
    end
    
    def run
      dir = File.expand_path('../pages', __FILE__)
      FileUtils.mkdir(dir) unless File.exists? dir
      
      [fetch_digg_feed, fetch_hackernews_feed, fetch_delicious_feed].each do |feed|
        parse_rss(feed) do |url, title|
          filename = title.gsub(/\W/, '_') + '.html'
          filepath = File.join(dir, filename)
          puts "fetching #{url} as #{filepath}"
          puts `curl --connect-timeout=5 #{url} > #{filepath} &`
          sleep 1
        end
      end
    end
    
  end
end

if __FILE__ == $0
  Program.run
end
