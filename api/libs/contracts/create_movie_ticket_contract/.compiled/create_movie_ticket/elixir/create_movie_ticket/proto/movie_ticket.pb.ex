defmodule ForgeAbi.CreateMovieTicketTx do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          ticket: ForgeAbi.MovieTicket.t() | nil
        }
  defstruct [:ticket]

  field :ticket, 1, type: ForgeAbi.MovieTicket
end

defmodule ForgeAbi.MovieTicket do
  @moduledoc false
  use Protobuf, syntax: :proto3

  @type t :: %__MODULE__{
          cinema: String.t(),
          name: String.t(),
          location: String.t(),
          row: String.t(),
          seat: String.t(),
          datetime: String.t()
        }
  defstruct [:cinema, :name, :location, :row, :seat, :datetime]

  field :cinema, 1, type: :string
  field :name, 2, type: :string
  field :location, 3, type: :string
  field :row, 4, type: :string
  field :seat, 5, type: :string
  field :datetime, 6, type: :string
end
