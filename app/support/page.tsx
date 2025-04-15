const patreonUrl =
  "https://patreon.com/sovereigncallofficial?utm_medium=unknown&utm_source=join_link&utm_campaign=creatorshare_creator&utm_content=copyLink"

const SupportPage = () => {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Support Us</h1>
      <p className="mb-4">We appreciate your support! Your contributions help us continue creating content.</p>
      <div className="mb-4">
        <a href={patreonUrl} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Support Us on Patreon
        </a>
      </div>
      <p>Thank you for your generosity!</p>
    </div>
  )
}

export default SupportPage
